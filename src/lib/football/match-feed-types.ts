import type { FootballMatch } from "@/types/match";

export type MatchFeedSource = "api-football" | "football-data.org";

export type MatchFeedResult = {
  matches: FootballMatch[];
  source: MatchFeedSource;
  fetchedAt: string;
  cached?: boolean;
  stale?: boolean;
};