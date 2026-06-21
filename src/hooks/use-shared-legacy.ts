"use client";

import { useQuery } from "@tanstack/react-query";
import type { LegacyDocument } from "@/types/legacy";

export type SharedLegacyGhost = {
  name: string;
  team: string;
  evolutionScore: number;
  confidence: number;
  mood: string;
  tokenId: number;
};

export type SharedLegacyResult = {
  ghost: SharedLegacyGhost;
  legacy: LegacyDocument;
  rootHash: string;
  fetchedAt: string;
};

async function fetchSharedLegacy(tokenId: number): Promise<SharedLegacyResult> {
  const res = await fetch(`/api/legacy/share?tokenId=${tokenId}`, { cache: "no-store" });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error ?? "Shared legacy unavailable");
  }
  return res.json();
}

export function useSharedLegacy(tokenId: number | null) {
  const query = useQuery({
    queryKey: ["legacy-share", tokenId],
    queryFn: () => fetchSharedLegacy(tokenId!),
    enabled: tokenId != null && Number.isFinite(tokenId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  });

  return {
    shared: query.data ?? null,
    loading: query.isLoading && !query.data,
    error: query.error instanceof Error ? query.error.message : null,
  };
}