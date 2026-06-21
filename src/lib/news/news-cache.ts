import type { NewsFeedResult } from "@/types/news";

export const NEWS_CACHE_TTL_MS = 15 * 60_000;

type CacheEntry = {
  result: NewsFeedResult;
  storedAt: number;
};

const globalForCache = globalThis as typeof globalThis & {
  __goalghostNewsCache?: CacheEntry;
};

function store(): CacheEntry | undefined {
  return globalForCache.__goalghostNewsCache;
}

export const newsCache = {
  get(): CacheEntry | null {
    return store() ?? null;
  },

  set(result: NewsFeedResult): void {
    globalForCache.__goalghostNewsCache = {
      result,
      storedAt: Date.now(),
    };
  },

  isFresh(ttlMs = NEWS_CACHE_TTL_MS): boolean {
    const entry = store();
    if (!entry) return false;
    return Date.now() - entry.storedAt < ttlMs;
  },
};