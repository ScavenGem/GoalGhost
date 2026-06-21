import type { FootballMatch } from "@/types/match";
import { FootballApiError } from "./errors";
import {
  applyLiveMinutes,
  normalizeStatus,
  resolveLiveMinute,
  stampLiveClock,
} from "./status";

const BASE = "https://api.football-data.org/v4";
const DAY_MS = 24 * 60 * 60 * 1000;
const FINISHED_WINDOW_MS = 7 * DAY_MS;
const UPCOMING_WINDOW_MS = 14 * DAY_MS;

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: "Group Stage",
  LAST_16: "Round of 16",
  QUARTER_FINALS: "Quarter-Final",
  SEMI_FINALS: "Semi-Final",
  THIRD_PLACE: "Third Place",
  FINAL: "Final",
};

function formatApiDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatGroup(group: string): string {
  const letter = group.match(/^GROUP_([A-Z])$/i);
  if (letter) return `Group ${letter[1].toUpperCase()}`;
  return group.replace(/_/g, " ");
}

function formatStage(stage: string): string {
  return STAGE_LABELS[stage] ?? stage.replace(/_/g, " ");
}

function formatCompetition(m: Record<string, unknown>): string {
  const group = m.group as string | null | undefined;
  const stage = String(m.stage ?? "");

  if (group) return `FIFA World Cup · ${formatGroup(group)}`;
  if (stage && stage !== "REGULAR_SEASON") {
    return `FIFA World Cup · ${formatStage(stage)}`;
  }
  return "FIFA World Cup";
}

function isValidTeam(team: Record<string, unknown> | undefined): team is Record<string, string> {
  const name = team?.name;
  return typeof name === "string" && name.trim().length > 0;
}

function extractLiveScore(
  score: {
    fullTime?: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  } | undefined,
  status: string
): { home: number; away: number } | undefined {
  const ft = score?.fullTime;
  if (ft?.home != null && ft?.away != null) {
    return { home: ft.home, away: ft.away };
  }

  const ht = score?.halfTime;
  if (
    (status === "LIVE" || status === "PAUSED") &&
    ht?.home != null &&
    ht?.away != null
  ) {
    return { home: ht.home, away: ht.away };
  }

  return undefined;
}

function parseApiNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function extractHalfTime(score: {
  halfTime?: { home: number | null; away: number | null };
} | undefined): { home: number; away: number } | undefined {
  const ht = score?.halfTime;
  if (ht?.home != null && ht?.away != null) {
    return { home: ht.home, away: ht.away };
  }
  return undefined;
}

function extractLiveTiming(
  m: Record<string, unknown>,
  status: string,
  utcDate?: string,
  halfTime?: { home: number; away: number }
): { minute?: number; injuryTime?: number } {
  const normalized = normalizeStatus(status);
  if (normalized !== "LIVE" && normalized !== "PAUSED") return {};

  const apiMinute = parseApiNumber(m.minute);
  const apiInjuryTime = parseApiNumber(m.injuryTime);
  const lastUpdated =
    typeof m.lastUpdated === "string" ? m.lastUpdated : undefined;

  if (!utcDate) {
    if (apiMinute != null && apiMinute >= 0) {
      const injury =
        apiInjuryTime != null && apiInjuryTime > 0 ? apiInjuryTime : undefined;
      return { minute: apiMinute, injuryTime: injury };
    }
    return {};
  }

  const resolved = resolveLiveMinute({
    utcDate,
    status: normalized,
    rawApiStatus: status,
    halfTime,
    apiMinute,
    apiInjuryTime,
    lastUpdated,
  });

  return resolved ?? {};
}

function mapFootballDataMatch(m: Record<string, unknown>): FootballMatch | null {
  const home = m.homeTeam as Record<string, string> | undefined;
  const away = m.awayTeam as Record<string, string> | undefined;
  if (!isValidTeam(home) || !isValidTeam(away)) return null;

  const score = m.score as {
    fullTime?: { home: number | null; away: number | null };
    halfTime?: { home: number | null; away: number | null };
  };
  const rawStatus = String(m.status ?? "SCHEDULED");
  const status = normalizeStatus(rawStatus);
  const rawApiStatus = rawStatus;
  const matchScore = extractLiveScore(score, status);
  const utcDate = String(m.utcDate);
  const halfTime = extractHalfTime(score);
  const lastUpdated =
    typeof m.lastUpdated === "string" ? m.lastUpdated : undefined;
  const apiMinute = parseApiNumber(m.minute);
  const apiInjuryTime = parseApiNumber(m.injuryTime);
  const { minute, injuryTime } = extractLiveTiming(m, status, utcDate, halfTime);

  return {
    id: `fd-${m.id}`,
    homeTeam: home.name ?? home.shortName ?? "Home",
    awayTeam: away.name ?? away.shortName ?? "Away",
    homeTeamCode: home.tla ?? "HOM",
    awayTeamCode: away.tla ?? "AWY",
    status,
    utcDate,
    score: matchScore,
    minute,
    injuryTime,
    apiMinute: apiMinute ?? undefined,
    apiInjuryTime:
      apiInjuryTime != null && apiInjuryTime > 0 ? apiInjuryTime : undefined,
    halfTime,
    lastUpdated,
    rawApiStatus,
    competition: formatCompetition(m),
  };
}

function stampAllLiveClocks(matches: FootballMatch[]): FootballMatch[] {
  const now = Date.now();
  return matches.map((m) =>
    m.status === "LIVE" || m.status === "PAUSED" ? stampLiveClock(m, now) : m
  );
}

function withinFeedWindow(match: FootballMatch, now: number): boolean {
  const kickoff = new Date(match.utcDate).getTime();
  if (Number.isNaN(kickoff)) return false;

  if (match.status === "LIVE" || match.status === "PAUSED") return true;
  if (match.status === "SCHEDULED") return kickoff >= now && kickoff - now <= UPCOMING_WINDOW_MS;
  if (match.status === "FINISHED") return now - kickoff <= FINISHED_WINDOW_MS;
  return false;
}

async function fetchFootballDataMatches(
  apiKey: string,
  status: string,
  dateFrom?: string,
  dateTo?: string
): Promise<FootballMatch[]> {
  const url = new URL(`${BASE}/competitions/WC/matches`);
  url.searchParams.set("status", status);
  if (dateFrom) url.searchParams.set("dateFrom", dateFrom);
  if (dateTo) url.searchParams.set("dateTo", dateTo);

  const res = await fetch(url.toString(), {
    headers: { "X-Auth-Token": apiKey },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new FootballApiError(
      `football-data.org ${res.status}: ${body.slice(0, 120)}`,
      res.status
    );
  }

  const data = await res.json();
  const now = Date.now();

  return (data.matches ?? [])
    .map((raw: Record<string, unknown>) => mapFootballDataMatch(raw))
    .filter((m: FootballMatch | null): m is FootballMatch => m !== null)
    .filter((m: FootballMatch) => withinFeedWindow(m, now));
}

const ALL_FEED_STATUSES =
  "SCHEDULED,TIMED,FINISHED,LIVE,IN_PLAY,PAUSED";

/** Lightweight live-only fetch for rate-limit fallback (1 req). */
export async function fetchLiveFootballDataOnly(
  apiKey: string
): Promise<FootballMatch[]> {
  const matches = await fetchFootballDataMatches(
    apiKey,
    "LIVE,IN_PLAY,PAUSED"
  );
  return stampAllLiveClocks(applyLiveMinutes(matches));
}

export async function fetchFromFootballData(apiKey: string): Promise<FootballMatch[]> {
  const now = Date.now();
  const dateFrom = formatApiDate(new Date(now - FINISHED_WINDOW_MS));
  const dateTo = formatApiDate(new Date(now + UPCOMING_WINDOW_MS));

  const matches = await fetchFootballDataMatches(
    apiKey,
    ALL_FEED_STATUSES,
    dateFrom,
    dateTo
  );

  return stampAllLiveClocks(applyLiveMinutes(matches));
}