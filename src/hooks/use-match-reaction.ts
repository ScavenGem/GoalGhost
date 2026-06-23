"use client";

import { useCallback, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import type { FootballMatch } from "@/types/match";
import { uploadJsonFromBrowser } from "@/lib/0g/storage/upload-browser";
import { notifyMemoryAdded } from "@/lib/events/memory-sync";
import { useGhost } from "@/hooks/use-ghost";
import { buildEmojiReactionMemory } from "@/lib/match-reactions/content";
import { buildMatchEmojiReactionMessage } from "@/lib/match-reactions/sign";
import type { MatchEmojiReactionId } from "@/lib/match-reactions/types";
import { MATCH_EMOJI_REACTIONS } from "@/lib/match-reactions/types";
import type { MatchEmojiReactionSummary } from "@/types/match-emoji-reaction";

export type GhostState = {
  name: string;
  team: string;
  mood: string;
  evolutionScore: number;
  confidence: number;
  tokenId: number;
};

export type ReactionToast = {
  matchId: string;
  title: string;
  reaction: string;
  mood: string;
  memorySaved: boolean;
  rootHash?: string;
};

type SealEmojiMemoryParams = {
  match: FootballMatch;
  reactionId: MatchEmojiReactionId;
  ghost: GhostState;
  address: string;
  signature: string;
  createdAt: string;
  setGhost: ReturnType<typeof useGhost>["setGhost"];
  invalidate: () => void;
  setToast: (toast: ReactionToast | null) => void;
  setErrorToast: (msg: string | null) => void;
};

async function sealEmojiReactionMemory({
  match,
  reactionId,
  ghost,
  address,
  signature,
  createdAt,
  setGhost,
  invalidate,
  setToast,
  setErrorToast,
}: SealEmojiMemoryParams) {
  const reactionMeta = MATCH_EMOJI_REACTIONS.find((r) => r.id === reactionId);
  if (!reactionMeta) return;

  try {
    const memoryPayload = buildEmojiReactionMemory(reactionId, match, ghost);
    const eventId = `mem-emoji-${match.id}-${reactionId}-${Date.now()}`;
    const memory = {
      version: 1 as const,
      id: eventId,
      tokenId: ghost.tokenId,
      type: "match_reaction" as const,
      matchId: match.id,
      title: memoryPayload.title,
      content: memoryPayload.content,
      emotionalTone: memoryPayload.emotionalTone,
      evolutionDelta: memoryPayload.evolutionDelta,
      timestamp: createdAt,
      metadata: {
        reactionKind: "emoji",
        reactionId,
        emoji: reactionMeta.emoji,
        walletAddress: address.toLowerCase(),
        signature,
        matchStatus: match.status,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        score: match.score,
        minute: match.minute,
      },
    };

    const { rootHash } = await uploadJsonFromBrowser(memory);
    const confidenceDelta = Math.round(memoryPayload.evolutionDelta * 0.8);

    await fetch("/api/memories/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId: ghost.tokenId,
        eventId,
        type: "match_reaction",
        matchId: match.id,
        rootHash,
        occurredAt: createdAt,
        title: memory.title,
        content: memory.content,
        emotionalTone: memory.emotionalTone,
        evolutionDelta: memoryPayload.evolutionDelta,
        confidenceDelta,
        mood: memoryPayload.emotionalTone,
      }),
    });

    setGhost((g) =>
      g
        ? {
            ...g,
            mood: memoryPayload.emotionalTone,
            evolutionScore: g.evolutionScore + memoryPayload.evolutionDelta,
            confidence: Math.min(100, g.confidence + confidenceDelta),
          }
        : g
    );

    notifyMemoryAdded({ matchId: match.id, eventId });
    void invalidate();

    setToast({
      matchId: match.id,
      title: memoryPayload.title,
      reaction: `${reactionMeta.emoji} ${memoryPayload.content}`,
      mood: memoryPayload.emotionalTone,
      memorySaved: true,
      rootHash,
    });
    setTimeout(() => setToast(null), 6000);
  } catch (e) {
    console.error("Emoji memory seal failed:", e);
    setErrorToast(
      e instanceof Error ? e.message : "Reaction saved. Legacy seal pending."
    );
    setTimeout(() => setErrorToast(null), 5000);
  }
}

export function useMatchReaction() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { ghost, refetch, setGhost, invalidate } = useGhost(address);
  const [reacting, setReacting] = useState<string | null>(null);
  const [emojiReacting, setEmojiReacting] = useState<{
    matchId: string;
    reactionId: MatchEmojiReactionId;
  } | null>(null);
  const [toast, setToast] = useState<ReactionToast | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const loadGhost = useCallback(() => {
    void refetch();
  }, [refetch]);

  const reactToMatch = useCallback(
    async (match: FootballMatch) => {
      if (!ghost) return;
      setReacting(match.id);

      try {
        const isLive = match.status === "LIVE" || match.status === "PAUSED";
        const teamInMatch =
          ghost.team === match.homeTeam || ghost.team === match.awayTeam;

        const res = await fetch("/api/compute/match-reaction", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ghost,
            match,
            eventType: isLive
              ? teamInMatch
                ? "LIVE_TEAM_PLAYING"
                : "LIVE_NEUTRAL"
              : match.status === "FINISHED"
                ? "FINISHED_REFLECTION"
                : "UPCOMING_ANTICIPATION",
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.reaction) {
          throw new Error(data.error ?? "0G Compute returned no reaction");
        }

        const evolutionDelta = data.reaction.evolutionDelta ?? 5;
        const confidenceDelta = Math.round(evolutionDelta * 0.8);
        const eventId = `mem-${match.id}-${Date.now()}`;
        const memory = {
          version: 1 as const,
          id: eventId,
          tokenId: ghost.tokenId,
          type: "match_reaction" as const,
          matchId: match.id,
          title: data.reaction.title,
          content: data.reaction.reaction,
          emotionalTone: data.reaction.emotionalTone,
          evolutionDelta,
          timestamp: new Date().toISOString(),
          computeProof: data.proof,
        };

        const { rootHash } = await uploadJsonFromBrowser(memory);

        await fetch("/api/memories/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: ghost.tokenId,
            eventId,
            type: "match_reaction",
            matchId: match.id,
            rootHash,
            occurredAt: memory.timestamp,
            title: memory.title,
            content: memory.content,
            emotionalTone: memory.emotionalTone,
            evolutionDelta,
            confidenceDelta,
            mood: data.reaction.emotionalTone,
          }),
        });

        setGhost((g) =>
          g
            ? {
                ...g,
                mood: data.reaction.emotionalTone,
                evolutionScore: g.evolutionScore + evolutionDelta,
                confidence: Math.min(100, g.confidence + confidenceDelta),
              }
            : g
        );

        notifyMemoryAdded({ matchId: match.id, eventId });
        void invalidate();

        setToast({
          matchId: match.id,
          title: data.reaction.title,
          reaction: data.reaction.reaction,
          mood: data.reaction.emotionalTone,
          memorySaved: true,
          rootHash,
        });
        setTimeout(() => setToast(null), 9000);
      } catch (e) {
        console.error("Match reaction failed:", e);
        setErrorToast(
          e instanceof Error ? e.message : "Could not seal reaction to 0G Storage"
        );
        setTimeout(() => setErrorToast(null), 7000);
      } finally {
        setReacting(null);
      }
    },
    [ghost, invalidate, setGhost]
  );

  const reactWithEmoji = useCallback(
    async (
      match: FootballMatch,
      reactionId: MatchEmojiReactionId
    ): Promise<MatchEmojiReactionSummary | null> => {
      if (!address || !isConnected) {
        setErrorToast("Connect your wallet to react");
        setTimeout(() => setErrorToast(null), 5000);
        return null;
      }

      setEmojiReacting({ matchId: match.id, reactionId });

      try {
        const createdAt = new Date().toISOString();
        const tokenId = ghost?.tokenId ?? 0;
        const message = buildMatchEmojiReactionMessage({
          address,
          tokenId,
          matchId: match.id,
          reactionId,
          createdAt,
        });

        const signature = await signMessageAsync({ message });

        const reactionRes = await fetch("/api/matches/emoji-reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            matchId: match.id,
            walletAddress: address.toLowerCase(),
            tokenId,
            reactionId,
            signature,
            createdAt,
          }),
        });

        const reactionData = (await reactionRes.json()) as {
          summary?: MatchEmojiReactionSummary;
          error?: string;
        };

        if (!reactionRes.ok || !reactionData.summary) {
          throw new Error(reactionData.error ?? "Could not save emoji reaction");
        }

        if (ghost) {
          void sealEmojiReactionMemory({
            match,
            reactionId,
            ghost,
            address,
            signature,
            createdAt,
            setGhost,
            invalidate,
            setToast,
            setErrorToast,
          });
        }

        return reactionData.summary;
      } catch (e) {
        console.error("Emoji reaction failed:", e);
        const msg = e instanceof Error ? e.message : "Could not save emoji reaction";
        if (msg.toLowerCase().includes("user rejected") || msg.toLowerCase().includes("denied")) {
          setErrorToast("Wallet signature cancelled");
        } else {
          setErrorToast(msg);
        }
        setTimeout(() => setErrorToast(null), 7000);
        return null;
      } finally {
        setEmojiReacting(null);
      }
    },
    [address, ghost, invalidate, isConnected, setGhost, signMessageAsync]
  );

  return {
    ghost,
    reacting,
    emojiReacting,
    toast,
    errorToast,
    loadGhost,
    reactToMatch,
    reactWithEmoji,
  };
}