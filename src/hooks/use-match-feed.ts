"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, type QueryClient } from "@tanstack/react-query";
import type { FootballMatch } from "@/types/match";
import type { MatchFeedResult, MatchFeedSource } from "@/lib/football/match-feed-types";
import { MATCH_FEED_POLL_MS } from "@/lib/football/match-cache";
import { applyLiveMinutes } from "@/lib/football/status";

const LIVE_CLOCK_TICK_MS = 1_000;

export const MATCH_FEED_QUERY_KEY = ["match-feed"] as const;

async function fetchMatchFeed(): Promise<MatchFeedResult> {
  const res = await fetch(`/api/matches/live?t=${Date.now()}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Match feed unavailable");
  return res.json();
}

export function prefetchMatchFeed(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: MATCH_FEED_QUERY_KEY,
    queryFn: fetchMatchFeed,
    staleTime: 0,
  });
}

export function useMatchFeed(options?: { poll?: boolean; pollMs?: number }) {
  const poll = options?.poll ?? true;
  const pollMs = options?.pollMs ?? MATCH_FEED_POLL_MS;

  const query = useQuery({
    queryKey: MATCH_FEED_QUERY_KEY,
    queryFn: fetchMatchFeed,
    staleTime: 0,
    gcTime: 10 * 60_000,
    refetchInterval: poll ? pollMs : false,
    refetchIntervalInBackground: poll,
    refetchOnWindowFocus: poll,
    placeholderData: (previous) => previous,
  });

  const [clockTick, setClockTick] = useState(0);

  useEffect(() => {
    if (!poll) return;
    const id = window.setInterval(() => {
      setClockTick((t) => t + 1);
    }, LIVE_CLOCK_TICK_MS);
    return () => window.clearInterval(id);
  }, [poll]);

  const data = query.data;
  const matches: FootballMatch[] = useMemo(() => {
    const raw = data?.matches?.length ? data.matches : [];
    return applyLiveMinutes(raw);
  }, [data?.matches, clockTick]);

  return {
    matches,
    source: (data?.source ?? "football-data.org") as MatchFeedSource,
    fetchedAt: data?.fetchedAt ?? null,
    stale: !!data?.stale,
    loading: query.isLoading && !data,
    refreshing: query.isFetching && !query.isLoading,
    loadMatches: () => query.refetch(),
  };
}