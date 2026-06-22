import type { FootballMatch } from "@/types/match";

export type PreMatchFixture = {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode?: string;
  awayTeamCode?: string;
  utcDate?: string;
};

/** Build /create URL with the next upcoming match for pre-match reaction flow. */
export function buildPreMatchCreateHref(next?: FootballMatch): string {
  if (!next) return "/create";

  const params = new URLSearchParams({
    intent: "pre-match",
    matchId: next.id,
    homeTeam: next.homeTeam,
    awayTeam: next.awayTeam,
    homeTeamCode: next.homeTeamCode,
    awayTeamCode: next.awayTeamCode,
  });
  if (next.utcDate) params.set("utcDate", next.utcDate);

  return `/create?${params.toString()}`;
}

export function parsePreMatchFixture(
  params: URLSearchParams
): PreMatchFixture | null {
  if (params.get("intent") !== "pre-match") return null;

  const matchId = params.get("matchId")?.trim();
  const homeTeam = params.get("homeTeam")?.trim();
  const awayTeam = params.get("awayTeam")?.trim();
  if (!matchId || !homeTeam || !awayTeam) return null;

  return {
    matchId,
    homeTeam,
    awayTeam,
    homeTeamCode: params.get("homeTeamCode")?.trim() || undefined,
    awayTeamCode: params.get("awayTeamCode")?.trim() || undefined,
    utcDate: params.get("utcDate")?.trim() || undefined,
  };
}