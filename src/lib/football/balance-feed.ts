import type { FootballMatch } from "@/types/match";
import { groupMatches } from "./group-matches";

/**
 * Keep all live matches plus a sensible slice of recent results and upcoming fixtures.
 */
export function curateMatchFeed(
  matches: FootballMatch[],
  limits = { finished: 12, upcoming: 16 }
): FootballMatch[] {
  const { live, finished, upcoming } = groupMatches(matches);

  return [
    ...live,
    ...finished.slice(0, limits.finished),
    ...upcoming.slice(0, limits.upcoming),
  ];
}

/** @deprecated Use curateMatchFeed, kept for compatibility */
export function balanceMatchFeed(matches: FootballMatch[], max = 24): FootballMatch[] {
  return curateMatchFeed(matches, {
    finished: Math.floor(max / 3),
    upcoming: Math.floor(max / 2),
  }).slice(0, max);
}