export type MatchStatus = "SCHEDULED" | "LIVE" | "FINISHED" | "PAUSED";

export type MatchEvent = {
  id: string;
  matchId: string;
  type: "GOAL" | "FULL_TIME" | "KICK_OFF" | "HALF_TIME";
  minute: number;
  team: string;
  player?: string;
  score?: { home: number; away: number };
};

export type FootballMatch = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode: string;
  awayTeamCode: string;
  status: MatchStatus;
  utcDate: string;
  score?: { home: number; away: number };
  minute?: number;
  /** Stoppage time minutes elapsed (football-data.org injuryTime). */
  injuryTime?: number;
  /** Raw API minute when football-data.org provides it (for extrapolation). */
  apiMinute?: number;
  apiInjuryTime?: number;
  /** Half-time score from API; used to anchor second-half clock when minute is omitted. */
  halfTime?: { home: number; away: number };
  /** football-data.org lastUpdated; anchors API minute extrapolation. */
  lastUpdated?: string;
  /** Raw football-data.org status (e.g. IN_PLAY, PAUSED) for half-time detection. */
  rawApiStatus?: string;
  /** ISO timestamp when minute/injuryTime were last resolved from provider data. */
  clockSyncedAt?: string;
  /** Match minute at clockSyncedAt; extrapolated client-side between polls. */
  clockSyncedMinute?: number;
  clockSyncedInjuryTime?: number;
  competition: string;
};