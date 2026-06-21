import type { FootballMatch } from "@/types/match";

export type MatchSections = {
  live: FootballMatch[];
  finished: FootballMatch[];
  upcoming: FootballMatch[];
};

export function groupMatches(matches: FootballMatch[]): MatchSections {
  const live = matches
    .filter((m) => m.status === "LIVE" || m.status === "PAUSED")
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

  const finished = matches
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());

  const upcoming = matches
    .filter((m) => m.status === "SCHEDULED")
    .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime());

  return { live, finished, upcoming };
}