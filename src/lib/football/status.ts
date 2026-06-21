import type { FootballMatch, MatchStatus } from "@/types/match";

const STATUS_MAP: Record<string, MatchStatus> = {
  LIVE: "LIVE",
  IN_PLAY: "LIVE",
  "1H": "LIVE",
  "2H": "LIVE",
  ET: "LIVE",
  P: "LIVE",
  BT: "PAUSED",
  HT: "PAUSED",
  PAUSED: "PAUSED",
  SUSPENDED: "PAUSED",
  SCHEDULED: "SCHEDULED",
  TIMED: "SCHEDULED",
  NS: "SCHEDULED",
  TBD: "SCHEDULED",
  FINISHED: "FINISHED",
  FT: "FINISHED",
  AET: "FINISHED",
  PEN: "FINISHED",
  AWARDED: "FINISHED",
};

export function normalizeStatus(raw: string): MatchStatus {
  return STATUS_MAP[raw] ?? "SCHEDULED";
}

export function formatKickoff(utcDate: string): string {
  const kickoff = new Date(utcDate);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const kickStart = new Date(
    kickoff.getFullYear(),
    kickoff.getMonth(),
    kickoff.getDate()
  );
  const dayDiff = Math.round(
    (kickStart.getTime() - todayStart.getTime()) / 86_400_000
  );

  const time = kickoff.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  if (dayDiff === 0) return `Today • ${time}`;
  if (dayDiff === 1) return `Tomorrow • ${time}`;
  if (dayDiff === -1) return `Yesterday • ${time}`;

  const date = kickoff.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  return `${date} • ${time}`;
}

const FIRST_HALF_END = 45;
const TYPICAL_FIRST_HALF_STOPPAGE = 2;
const TYPICAL_HALF_TIME_BREAK = 15;

export type LiveMinuteInput = {
  utcDate: string;
  status: MatchStatus;
  rawApiStatus?: string;
  halfTime?: { home: number; away: number };
  apiMinute?: number;
  apiInjuryTime?: number;
  lastUpdated?: string;
  nowMs?: number;
};

function isHalfTimePause(rawApiStatus?: string, halfTime?: { home: number; away: number }): boolean {
  const raw = rawApiStatus?.toUpperCase();
  if (raw === "HT" || raw === "BT") return true;
  if (raw === "PAUSED" && halfTime == null) return true;
  return false;
}

function secondHalfKickoffWallMin(): number {
  return FIRST_HALF_END + TYPICAL_FIRST_HALF_STOPPAGE + TYPICAL_HALF_TIME_BREAK;
}

function extrapolateApiMinute(
  minute: number,
  injuryTime: number | undefined,
  syncAgeMin: number
): { minute: number; injuryTime?: number } {
  if (syncAgeMin <= 0) {
    return injuryTime != null && injuryTime > 0
      ? { minute, injuryTime }
      : { minute };
  }

  if (minute < FIRST_HALF_END) {
    const total = minute + syncAgeMin;
    if (total <= FIRST_HALF_END) return { minute: total };
    return { minute: FIRST_HALF_END, injuryTime: total - FIRST_HALF_END };
  }

  if (minute === FIRST_HALF_END && injuryTime != null && injuryTime > 0) {
    return { minute: FIRST_HALF_END, injuryTime: injuryTime + syncAgeMin };
  }

  const total = minute + syncAgeMin;
  if (total <= 90) return { minute: total };
  if (minute >= 90) {
    return { minute: 90, injuryTime: (injuryTime ?? 0) + syncAgeMin };
  }
  return { minute: 90, injuryTime: total - 90 };
}

function resolveWallClockMinute(
  input: Omit<LiveMinuteInput, "apiMinute" | "apiInjuryTime" | "lastUpdated">
): { minute: number; injuryTime?: number } | undefined {
  const { utcDate, status, halfTime, rawApiStatus } = input;
  const nowMs = input.nowMs ?? Date.now();

  if (status !== "LIVE" && status !== "PAUSED") return undefined;

  const kickoff = new Date(utcDate).getTime();
  if (Number.isNaN(kickoff) || nowMs < kickoff) return undefined;

  if (status === "PAUSED" && isHalfTimePause(rawApiStatus, halfTime)) {
    return { minute: FIRST_HALF_END };
  }

  const wallMin = Math.floor((nowMs - kickoff) / 60_000);
  if (wallMin < 0) return undefined;

  const hasHalfTime = halfTime != null;
  const htBreakEnd = secondHalfKickoffWallMin();

  if (status === "PAUSED") {
    if (!hasHalfTime || wallMin < htBreakEnd) {
      return { minute: FIRST_HALF_END };
    }
    const playMin = wallMin - htBreakEnd + 46;
    if (playMin <= 90) return { minute: playMin };
    return { minute: 90, injuryTime: playMin - 90 };
  }

  if (!hasHalfTime) {
    if (wallMin < 1) return { minute: 1 };
    if (wallMin <= FIRST_HALF_END) return { minute: wallMin };
    if (wallMin <= FIRST_HALF_END + 8) {
      return { minute: FIRST_HALF_END, injuryTime: wallMin - FIRST_HALF_END };
    }
    if (wallMin < htBreakEnd) return { minute: FIRST_HALF_END };
    const playMin = wallMin - htBreakEnd + 46;
    if (playMin <= 90) return { minute: playMin };
    return { minute: 90, injuryTime: playMin - 90 };
  }

  if (wallMin < htBreakEnd) return { minute: FIRST_HALF_END };

  const playMin = wallMin - htBreakEnd + 46;
  if (playMin <= 90) return { minute: playMin };
  return { minute: 90, injuryTime: playMin - 90 };
}

/**
 * Resolves the live match clock from football-data.org fields and kickoff time.
 * Uses API minute when present; otherwise anchors to lastUpdated and extrapolates.
 */
function tickSyncedClock(
  match: FootballMatch,
  nowMs: number
): { minute: number; injuryTime?: number } | undefined {
  if (
    match.clockSyncedAt == null ||
    match.clockSyncedMinute == null ||
    match.status !== "LIVE"
  ) {
    return undefined;
  }

  const anchorMs = new Date(match.clockSyncedAt).getTime();
  if (Number.isNaN(anchorMs)) return undefined;

  const syncAge = Math.floor((nowMs - anchorMs) / 60_000);
  if (syncAge <= 0) {
    return match.clockSyncedInjuryTime != null && match.clockSyncedInjuryTime > 0
      ? { minute: match.clockSyncedMinute, injuryTime: match.clockSyncedInjuryTime }
      : { minute: match.clockSyncedMinute };
  }

  return extrapolateApiMinute(
    match.clockSyncedMinute,
    match.clockSyncedInjuryTime,
    syncAge
  );
}

/** Stamps provider-resolved clock fields used for real-time extrapolation. */
export function stampLiveClock(
  match: FootballMatch,
  nowMs = Date.now()
): FootballMatch {
  if (match.status !== "LIVE" && match.status !== "PAUSED") return match;

  const timing = resolveLiveMinute({
    utcDate: match.utcDate,
    status: match.status,
    rawApiStatus: match.rawApiStatus,
    halfTime: match.halfTime,
    apiMinute: match.apiMinute,
    apiInjuryTime: match.apiInjuryTime,
    lastUpdated: match.lastUpdated,
    nowMs,
  });

  if (!timing) return match;

  return {
    ...match,
    minute: timing.minute,
    injuryTime: timing.injuryTime,
    clockSyncedAt: new Date(nowMs).toISOString(),
    clockSyncedMinute: timing.minute,
    clockSyncedInjuryTime: timing.injuryTime,
  };
}

export function resolveLiveMinute(
  input: LiveMinuteInput
): { minute: number; injuryTime?: number } | undefined {
  const { utcDate, status, halfTime, rawApiStatus, apiMinute, apiInjuryTime, lastUpdated } =
    input;
  const nowMs = input.nowMs ?? Date.now();

  if (status !== "LIVE" && status !== "PAUSED") return undefined;

  const kickoff = new Date(utcDate).getTime();
  if (Number.isNaN(kickoff) || nowMs < kickoff) return undefined;

  if (status === "PAUSED" && isHalfTimePause(rawApiStatus, halfTime)) {
    return { minute: FIRST_HALF_END };
  }

  if (apiMinute != null && apiMinute >= 0) {
    if (lastUpdated && status === "LIVE") {
      const syncAge = Math.floor(
        (nowMs - new Date(lastUpdated).getTime()) / 60_000
      );
      if (syncAge > 0) {
        return extrapolateApiMinute(apiMinute, apiInjuryTime, syncAge);
      }
    }
    return apiInjuryTime != null && apiInjuryTime > 0
      ? { minute: apiMinute, injuryTime: apiInjuryTime }
      : { minute: apiMinute };
  }

  if (lastUpdated && status === "LIVE") {
    const anchorMs = new Date(lastUpdated).getTime();
    if (!Number.isNaN(anchorMs) && anchorMs >= kickoff && anchorMs <= nowMs) {
      const anchored = resolveWallClockMinute({
        utcDate,
        status,
        rawApiStatus,
        halfTime,
        nowMs: anchorMs,
      });
      if (anchored) {
        const syncAge = Math.floor((nowMs - anchorMs) / 60_000);
        return extrapolateApiMinute(
          anchored.minute,
          anchored.injuryTime,
          syncAge
        );
      }
    }
  }

  return resolveWallClockMinute({ utcDate, status, rawApiStatus, halfTime, nowMs });
}

/** @deprecated Use resolveLiveMinute */
export function deriveLiveMinuteFromKickoff(
  utcDate: string,
  status: MatchStatus,
  nowMs = Date.now()
): { minute: number; injuryTime?: number } | undefined {
  return resolveLiveMinute({ utcDate, status, nowMs });
}

/** Recomputes live minutes client-side so the clock advances between feed polls. */
export function applyLiveMinutes(
  matches: FootballMatch[],
  nowMs = Date.now()
): FootballMatch[] {
  return matches.map((match) => {
    if (match.status !== "LIVE" && match.status !== "PAUSED") return match;

    const timing =
      match.status === "LIVE"
        ? (tickSyncedClock(match, nowMs) ??
          resolveLiveMinute({
            utcDate: match.utcDate,
            status: match.status,
            rawApiStatus: match.rawApiStatus,
            halfTime: match.halfTime,
            apiMinute: match.apiMinute,
            apiInjuryTime: match.apiInjuryTime,
            lastUpdated: match.lastUpdated,
            nowMs,
          }))
        : resolveLiveMinute({
            utcDate: match.utcDate,
            status: match.status,
            rawApiStatus: match.rawApiStatus,
            halfTime: match.halfTime,
            apiMinute: match.apiMinute,
            apiInjuryTime: match.apiInjuryTime,
            lastUpdated: match.lastUpdated,
            nowMs,
          });

    if (!timing) return match;
    if (
      timing.minute === match.minute &&
      timing.injuryTime === match.injuryTime
    ) {
      return match;
    }

    return { ...match, minute: timing.minute, injuryTime: timing.injuryTime };
  });
}

/** Formats live minute with optional stoppage time, e.g. 32' or 45+2'. */
export function formatLiveMinute(minute: number, injuryTime?: number): string {
  if (injuryTime != null && injuryTime > 0) {
    return `${minute}+${injuryTime}'`;
  }
  return `${minute}'`;
}

export function statusDisplayLabel(
  status: MatchStatus,
  minute?: number,
  utcDate?: string,
  injuryTime?: number
): string {
  if (status === "LIVE" && minute != null) {
    return `Live · ${formatLiveMinute(minute, injuryTime)}`;
  }
  if (status === "LIVE") return "Live";
  if (status === "PAUSED" && minute != null) {
    if (minute <= 45 && (injuryTime == null || injuryTime === 0)) {
      return "Half-Time";
    }
    return `Paused · ${formatLiveMinute(minute, injuryTime)}`;
  }
  if (status === "PAUSED") return "Half-Time";
  if (status === "FINISHED") return "Finished";
  if (status === "SCHEDULED" && utcDate) return formatKickoff(utcDate);
  return status;
}

export const STATUS_SORT: Record<MatchStatus, number> = {
  LIVE: 0,
  PAUSED: 1,
  SCHEDULED: 2,
  FINISHED: 3,
};

export function sortMatches<T extends { status: MatchStatus; utcDate: string }>(matches: T[]): T[] {
  return [...matches].sort((a, b) => {
    const sd = STATUS_SORT[a.status] - STATUS_SORT[b.status];
    if (sd !== 0) return sd;
    return new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime();
  });
}