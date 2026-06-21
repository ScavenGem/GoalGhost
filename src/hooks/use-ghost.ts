"use client";

import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

export type GhostApiRecord = {
  name: string;
  team: string;
  evolutionScore: number;
  confidence: number;
  mood: string;
  tokenId: number;
  profileRoot?: string;
  memories?: {
    eventId?: string;
    title?: string;
    content?: string;
    rootHash?: string;
    emotionalTone?: string;
    type?: string;
    occurredAt?: string;
    matchId?: string;
  }[];
};

const GHOST_STALE_MS = 45_000;

function ghostStaleTime(data: GhostApiRecord | null | undefined): number {
  return data ? GHOST_STALE_MS : 0;
}

async function fetchGhost(address: string): Promise<GhostApiRecord | null> {
  const res = await fetch(`/api/ghost/${address}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Ghost fetch failed: ${res.status}`);
  }
  const data = await res.json();
  return data?.ghost ?? null;
}

export function ghostQueryKey(address?: string) {
  return ["ghost", address?.toLowerCase() ?? ""] as const;
}

export function seedGhostCache(
  queryClient: QueryClient,
  address: string,
  ghost: GhostApiRecord
) {
  queryClient.setQueryData(ghostQueryKey(address), ghost);
}

export function invalidateGhostCache(
  queryClient: QueryClient,
  address: string
) {
  return queryClient.invalidateQueries({ queryKey: ghostQueryKey(address) });
}

/** Fetches from API and only updates cache when data exists; never wipes a seeded ghost. */
export async function syncGhostCache(
  queryClient: QueryClient,
  address: string,
  fallback?: GhostApiRecord
): Promise<GhostApiRecord | null> {
  try {
    const fetched = await fetchGhost(address);
    if (fetched) {
      seedGhostCache(queryClient, address, fetched);
      return fetched;
    }
  } catch {
    // Keep optimistic cache when the server index is temporarily unavailable.
  }

  if (fallback) {
    seedGhostCache(queryClient, address, fallback);
    return fallback;
  }

  return queryClient.getQueryData<GhostApiRecord | null>(ghostQueryKey(address)) ?? null;
}

export function prefetchGhost(queryClient: QueryClient, address: string) {
  return queryClient.prefetchQuery({
    queryKey: ghostQueryKey(address),
    queryFn: () => fetchGhost(address),
    staleTime: 0,
  });
}

export function useGhost(address?: string) {
  const queryClient = useQueryClient();
  const key = ghostQueryKey(address);

  const query = useQuery({
    queryKey: key,
    queryFn: () => fetchGhost(address!),
    enabled: !!address,
    staleTime: (q) => ghostStaleTime(q.state.data as GhostApiRecord | null | undefined),
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    placeholderData: (previous) => previous,
  });

  return {
    ghost: query.data ?? null,
    isLoading: query.isLoading && query.data === undefined,
    isFetching: query.isFetching,
    refetch: query.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: key }),
    setGhost: (updater: (prev: GhostApiRecord | null) => GhostApiRecord | null) => {
      queryClient.setQueryData<GhostApiRecord | null>(key, (prev) =>
        updater(prev ?? null)
      );
    },
  };
}