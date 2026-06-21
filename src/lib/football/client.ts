import { fetchFromApiFootball } from "./api-football";
import {
  fetchFromFootballData,
  fetchLiveFootballDataOnly,
} from "./football-data";
import { curateMatchFeed } from "./balance-feed";
import { applyLiveMinutes, sortMatches } from "./status";
import { matchFeedCache } from "./match-cache";
import { isRateLimited } from "./errors";
import type { FootballMatch } from "@/types/match";
import type { MatchFeedResult } from "./match-feed-types";

export type { MatchFeedSource, MatchFeedResult } from "./match-feed-types";

const PLACEHOLDER_KEYS = new Set(["", "your_football_data_api_key", "your_api_key_here"]);

function isConfiguredKey(key: string | undefined): boolean {
  if (!key) return false;
  return !PLACEHOLDER_KEYS.has(key.trim().toLowerCase());
}

function hasLiveProvider(): boolean {
  return (
    isConfiguredKey(process.env.API_FOOTBALL_KEY) ||
    isConfiguredKey(process.env.FOOTBALL_DATA_API_KEY)
  );
}

function emptyLiveFeed(source: MatchFeedResult["source"]): MatchFeedResult {
  return {
    matches: [],
    source,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchFromProviders(): Promise<MatchFeedResult | null> {
  const fetchedAt = new Date().toISOString();

  const footballDataKey = process.env.FOOTBALL_DATA_API_KEY;
  if (isConfiguredKey(footballDataKey)) {
    const feed = await fetchFootballDataWithLiveFallback(footballDataKey!);
    if (feed) return feed;
  }

  const apiFootballKey = process.env.API_FOOTBALL_KEY;
  if (isConfiguredKey(apiFootballKey)) {
    try {
      const matches = sortMatches(await fetchFromApiFootball(apiFootballKey!));
      if (matches.length > 0) {
        return { matches: curateMatchFeed(matches), source: "api-football", fetchedAt };
      }
    } catch (e) {
      if (isRateLimited(e)) {
        console.warn("API-Football rate limited (429) - will use cache");
      } else {
        console.error("API-Football error:", e);
      }
    }
  }

  return null;
}

function staleFromCache(): MatchFeedResult | null {
  const entry = matchFeedCache.get();
  if (!entry) return null;
  return {
    ...entry.result,
    matches: applyLiveMinutes(entry.result.matches),
    cached: true,
    stale: true,
  };
}

/** Replaces live entries in a cached feed with freshly fetched live matches. */
function mergeLiveIntoFeed(
  base: MatchFeedResult,
  freshLive: FootballMatch[]
): MatchFeedResult {
  const rest = base.matches.filter(
    (m) => m.status !== "LIVE" && m.status !== "PAUSED"
  );
  return {
    matches: curateMatchFeed(sortMatches([...freshLive, ...rest])),
    source: base.source,
    fetchedAt: new Date().toISOString(),
  };
}

async function fetchFootballDataWithLiveFallback(
  apiKey: string
): Promise<MatchFeedResult | null> {
  const fetchedAt = new Date().toISOString();

  try {
    const matches = sortMatches(await fetchFromFootballData(apiKey));
    if (matches.length > 0) {
      return {
        matches: curateMatchFeed(matches),
        source: "football-data.org",
        fetchedAt,
      };
    }
    return emptyLiveFeed("football-data.org");
  } catch (e) {
    if (!isRateLimited(e)) {
      console.error("football-data.org error:", e);
      return null;
    }

    console.warn(
      "football-data.org rate limited (429) - attempting live-only refresh"
    );

    const stale = matchFeedCache.get();
    try {
      const liveMatches = await fetchLiveFootballDataOnly(apiKey);
      if (liveMatches.length > 0 && stale) {
        return mergeLiveIntoFeed(stale.result, liveMatches);
      }
      if (liveMatches.length > 0) {
        return {
          matches: curateMatchFeed(sortMatches(liveMatches)),
          source: "football-data.org",
          fetchedAt,
        };
      }
    } catch (liveErr) {
      if (!isRateLimited(liveErr)) {
        console.error("football-data.org live refresh error:", liveErr);
      }
    }
  }

  return null;
}

/**
 * Live match feed: always fetches fresh provider data.
 * Stale cache is used only when providers fail (429/errors).
 * Priority: football-data.org → API-Football → stale cache → empty feed.
 */
export async function fetchMatches(): Promise<MatchFeedResult> {
  const fresh = await fetchFromProviders();
  if (fresh) {
    matchFeedCache.set(fresh);
    return fresh;
  }

  const stale = staleFromCache();
  if (stale) {
    console.warn("Match providers unavailable - serving last successful cache");
    return stale;
  }

  if (hasLiveProvider()) {
    console.warn("Match providers unavailable - returning empty feed");
    return emptyLiveFeed("football-data.org");
  }

  console.warn("No football API key configured - returning empty match feed");
  return emptyLiveFeed("football-data.org");
}

export { MATCH_FEED_CACHE_TTL_MS, MATCH_FEED_POLL_MS } from "./match-cache";