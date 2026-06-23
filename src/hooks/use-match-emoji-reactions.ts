"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { FootballMatch } from "@/types/match";
import type { MatchEmojiReactionId } from "@/lib/match-reactions/types";
import {
  EMPTY_EMOJI_COUNTS,
  type MatchEmojiReactionSummary,
  type MatchEmojiReactionsResult,
} from "@/types/match-emoji-reaction";

export const MATCH_EMOJI_REACTIONS_QUERY_KEY = ["match-emoji-reactions"] as const;

const REACTIONS_POLL_MS = 8_000;

async function fetchMatchEmojiReactions(
  matchIds: string[],
  wallet?: string
): Promise<MatchEmojiReactionsResult> {
  if (matchIds.length === 0) {
    return { matches: {}, fetchedAt: new Date().toISOString() };
  }

  const params = new URLSearchParams({ matchIds: matchIds.join(",") });
  if (wallet) params.set("wallet", wallet.toLowerCase());

  const res = await fetch(`/api/matches/emoji-reactions?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Reactions unavailable");
  return res.json();
}

export function applyOptimisticEmojiReaction(
  current: MatchEmojiReactionSummary,
  reactionId: MatchEmojiReactionId
): MatchEmojiReactionSummary {
  const counts = { ...current.counts };
  const previous = current.userReaction;

  if (previous === reactionId) return current;

  if (previous) {
    counts[previous] = Math.max(0, counts[previous] - 1);
  }

  counts[reactionId] += 1;

  return {
    counts,
    userReaction: reactionId,
  };
}

export function useMatchEmojiReactions(matchIds: string[]) {
  const { address } = useAccount();
  const queryClient = useQueryClient();

  const stableIds = useMemo(
    () => [...new Set(matchIds)].sort().join(","),
    [matchIds]
  );

  const idList = useMemo(
    () => (stableIds ? stableIds.split(",") : []),
    [stableIds]
  );

  const walletKey = address?.toLowerCase() ?? "";

  const query = useQuery({
    queryKey: [...MATCH_EMOJI_REACTIONS_QUERY_KEY, stableIds, walletKey],
    queryFn: () => fetchMatchEmojiReactions(idList, address),
    enabled: stableIds.length > 0,
    staleTime: 4_000,
    gcTime: 5 * 60_000,
    refetchInterval: REACTIONS_POLL_MS,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const summaries = query.data?.matches ?? {};

  const setMatchSummary = useCallback(
    (matchId: string, summary: MatchEmojiReactionSummary) => {
      queryClient.setQueryData<MatchEmojiReactionsResult>(
        [...MATCH_EMOJI_REACTIONS_QUERY_KEY, stableIds, walletKey],
        (old) => ({
          matches: { ...(old?.matches ?? {}), [matchId]: summary },
          fetchedAt: new Date().toISOString(),
        })
      );
    },
    [queryClient, stableIds, walletKey]
  );

  const getSummary = useCallback(
    (matchId: string): MatchEmojiReactionSummary => {
      return (
        summaries[matchId] ?? {
          counts: { ...EMPTY_EMOJI_COUNTS },
          userReaction: null,
        }
      );
    },
    [summaries]
  );

  return {
    summaries,
    getSummary,
    setMatchSummary,
    refetch: query.refetch,
    loading: query.isLoading,
  };
}

export function useEmojiReactionHandler(
  matchIds: string[],
  reactWithEmoji: (
    match: FootballMatch,
    reactionId: MatchEmojiReactionId
  ) => Promise<MatchEmojiReactionSummary | null>
) {
  const queryClient = useQueryClient();
  const { address } = useAccount();
  const { summaries: polledSummaries, getSummary, setMatchSummary } =
    useMatchEmojiReactions(matchIds);
  const pendingRef = useRef<Map<string, MatchEmojiReactionSummary>>(new Map());
  const [pendingVersion, bumpPending] = useState(0);

  const stableIds = useMemo(
    () => [...new Set(matchIds)].sort().join(","),
    [matchIds]
  );
  const walletKey = address?.toLowerCase() ?? "";
  const queryKey = useMemo(
    () => [...MATCH_EMOJI_REACTIONS_QUERY_KEY, stableIds, walletKey] as const,
    [stableIds, walletKey]
  );

  const summaries = useMemo(() => {
    if (pendingRef.current.size === 0) return polledSummaries;
    return { ...polledSummaries, ...Object.fromEntries(pendingRef.current) };
  }, [polledSummaries, pendingVersion]);

  const handleEmojiReact = useCallback(
    async (match: FootballMatch, reactionId: MatchEmojiReactionId) => {
      const previous = getSummary(match.id);
      if (previous.userReaction === reactionId) return;

      await queryClient.cancelQueries({ queryKey });

      const optimistic = applyOptimisticEmojiReaction(previous, reactionId);
      pendingRef.current.set(match.id, optimistic);
      bumpPending((n) => n + 1);
      setMatchSummary(match.id, optimistic);

      const summary = await reactWithEmoji(match, reactionId);

      if (summary) {
        setMatchSummary(match.id, summary);
        pendingRef.current.delete(match.id);
        bumpPending((n) => n + 1);
        void queryClient.invalidateQueries({
          queryKey: MATCH_EMOJI_REACTIONS_QUERY_KEY,
          refetchType: "active",
        });
      } else {
        pendingRef.current.delete(match.id);
        bumpPending((n) => n + 1);
        setMatchSummary(match.id, previous);
      }
    },
    [getSummary, queryClient, queryKey, reactWithEmoji, setMatchSummary]
  );

  return { summaries, handleEmojiReact };
}