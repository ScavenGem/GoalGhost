import type { MatchFeedResult } from "./match-feed-types";

/** Stale fallback only on provider errors - never used for live freshness. */
export const MATCH_FEED_CACHE_TTL_MS = 0;
export const MATCH_FEED_POLL_MS = 12_000;

type CacheEntry = {
  result: MatchFeedResult;
  storedAt: number;
};

const globalForCache = globalThis as typeof globalThis & {
  __goalghostMatchFeedCache?: CacheEntry;
};

function store(): CacheEntry | undefined {
  return globalForCache.__goalghostMatchFeedCache;
}

export const matchFeedCache = {
  get(): CacheEntry | null {
    return store() ?? null;
  },

  set(result: MatchFeedResult): void {
    globalForCache.__goalghostMatchFeedCache = {
      result,
      storedAt: Date.now(),
    };
  },

  isFresh(ttlMs = MATCH_FEED_CACHE_TTL_MS): boolean {
    const entry = store();
    if (!entry) return false;
    return Date.now() - entry.storedAt < ttlMs;
  },

  ageMs(): number | null {
    const entry = store();
    if (!entry) return null;
    return Date.now() - entry.storedAt;
  },
};