import type { FootballMatch } from "@/types/match";
import { FootballApiError } from "./errors";
import { normalizeStatus } from "./status";

const BASE = "https://v3.football.api-sports.io";

/** FIFA World Cup league id on API-Football */
const WC_LEAGUE_ID = 1;

export async function fetchFromApiFootball(apiKey: string): Promise<FootballMatch[]> {
  const season = process.env.API_FOOTBALL_SEASON ?? "2022";

  const [liveRes, fixturesRes] = await Promise.all([
    fetch(`${BASE}/fixtures?live=all`, {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
    }),
    fetch(`${BASE}/fixtures?league=${WC_LEAGUE_ID}&season=${season}&timezone=UTC`, {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
    }),
  ]);

  if (!liveRes.ok && !fixturesRes.ok) {
    throw new FootballApiError(
      `API-Football ${liveRes.status}`,
      liveRes.status
    );
  }

  const liveData = liveRes.ok ? await liveRes.json() : { response: [] };
  const fixturesData = fixturesRes.ok ? await fixturesRes.json() : { response: [] };

  const seen = new Set<string>();
  const merged: FootballMatch[] = [];

  for (const item of [...(liveData.response ?? []), ...(fixturesData.response ?? [])]) {
    const m = mapApiFootballFixture(item);
    if (!seen.has(m.id)) {
      seen.add(m.id);
      merged.push(m);
    }
  }

  const now = Date.now();
  const week = 7 * 24 * 60 * 60 * 1000;

  return merged
    .filter((m) => {
      if (m.status === "LIVE" || m.status === "PAUSED") return true;
      if (m.status === "SCHEDULED") {
        const t = new Date(m.utcDate).getTime();
        return t > now - day() && t < now + week;
      }
      if (m.status === "FINISHED") return now - new Date(m.utcDate).getTime() < day();
      return false;
    })
    .slice(0, 24);
}

function day() {
  return 24 * 60 * 60 * 1000;
}

function mapApiFootballFixture(item: Record<string, unknown>): FootballMatch {
  const fixture = item.fixture as Record<string, unknown>;
  const teams = item.teams as {
    home: { name: string; id: number };
    away: { name: string; id: number };
  };
  const goals = item.goals as { home: number | null; away: number | null };
  const league = item.league as { name: string; round?: string };
  const statusObj = fixture.status as { short: string; elapsed: number | null };

  const raw = statusObj?.short ?? "NS";
  const status = normalizeStatus(raw);
  const minute =
    statusObj?.elapsed != null
      ? statusObj.elapsed
      : status === "LIVE" || status === "PAUSED"
        ? undefined
        : undefined;

  return {
    id: `af-${fixture.id}`,
    homeTeam: teams.home.name,
    awayTeam: teams.away.name,
    homeTeamCode: teams.home.name.slice(0, 3).toUpperCase(),
    awayTeamCode: teams.away.name.slice(0, 3).toUpperCase(),
    status,
    utcDate: String(fixture.date),
    score:
      goals.home != null && goals.away != null
        ? { home: goals.home, away: goals.away }
        : undefined,
    minute: minute ?? undefined,
    competition: league?.round ? `World Cup · ${league.round}` : "FIFA World Cup",
  };
}