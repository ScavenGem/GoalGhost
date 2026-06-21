"use client";

import { useQuery, type QueryClient } from "@tanstack/react-query";
import type { NewsFeedResult } from "@/types/news";
import { NEWS_CACHE_TTL_MS } from "@/lib/news/news-cache";

export const WORLD_CUP_NEWS_QUERY_KEY = ["world-cup-news"] as const;

async function fetchWorldCupNewsFeed(): Promise<NewsFeedResult> {
  const res = await fetch("/api/news/world-cup");
  if (!res.ok) throw new Error("News feed unavailable");
  return res.json();
}

export function prefetchWorldCupNews(queryClient: QueryClient) {
  return queryClient.prefetchQuery({
    queryKey: WORLD_CUP_NEWS_QUERY_KEY,
    queryFn: fetchWorldCupNewsFeed,
    staleTime: NEWS_CACHE_TTL_MS,
  });
}

export function useWorldCupNews() {
  const query = useQuery({
    queryKey: WORLD_CUP_NEWS_QUERY_KEY,
    queryFn: fetchWorldCupNewsFeed,
    staleTime: NEWS_CACHE_TTL_MS,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
    placeholderData: (previous) => previous,
  });

  const data = query.data;

  return {
    articles: data?.articles ?? [],
    configured: data?.configured ?? true,
    stale: !!data?.stale,
    fetchedAt: data?.fetchedAt ?? null,
    loading: query.isLoading && !data,
    refreshing: query.isFetching && !query.isLoading,
    refresh: () => query.refetch(),
  };
}