"use client";

import { NationalFlag } from "@/components/matches/national-flag";
import { formatKickoff, formatLiveMinute } from "@/lib/football/status";
import type { FootballMatch } from "@/types/match";
import { cn } from "@/lib/utils/cn";

export function MatchFaceoff({
  match,
  ghostTeam,
  compact,
}: {
  match: FootballMatch;
  ghostTeam?: string;
  compact?: boolean;
}) {
  const isScheduled = match.status === "SCHEDULED";
  const isFinished = match.status === "FINISHED";
  const isActive = match.status === "LIVE" || match.status === "PAUSED";
  const flagSize = compact ? 40 : 52;

  const homeHighlight = !!ghostTeam && ghostTeam === match.homeTeam;
  const awayHighlight = !!ghostTeam && ghostTeam === match.awayTeam;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <NationalFlag
          team={match.homeTeam}
          code={match.homeTeamCode}
          size={flagSize}
          highlight={homeHighlight}
        />
        <span
          className={cn(
            "max-w-[120px] text-sm font-semibold leading-tight tracking-tight sm:max-w-[140px] sm:text-base",
            homeHighlight ? "text-[#F4C542]" : "text-white/90"
          )}
        >
          {match.homeTeam}
        </span>
      </div>

      <div className="flex min-w-[88px] flex-col items-center justify-center gap-1 px-1 sm:min-w-[100px]">
        {match.score ? (
          <p className="font-display text-3xl tracking-tight text-[#F4C542] sm:text-4xl">
            {match.score.home}
            <span className="mx-1.5 text-white/25">-</span>
            {match.score.away}
          </p>
        ) : isScheduled ? (
          <p className="text-center text-xs font-medium leading-snug text-[#F4C542] sm:text-sm">
            {formatKickoff(match.utcDate)}
          </p>
        ) : (
          <p className="font-display text-2xl text-white/20">vs</p>
        )}
        {isActive && match.minute != null && (
          <span className="text-[10px] font-medium uppercase tracking-wider text-red-200/90">
            {formatLiveMinute(match.minute, match.injuryTime)}
          </span>
        )}
        {isFinished && !match.score && (
          <span className="text-[10px] uppercase tracking-wider text-muted">
            Full time
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <NationalFlag
          team={match.awayTeam}
          code={match.awayTeamCode}
          size={flagSize}
          highlight={awayHighlight}
        />
        <span
          className={cn(
            "max-w-[120px] text-sm font-semibold leading-tight tracking-tight sm:max-w-[140px] sm:text-base",
            awayHighlight ? "text-[#F4C542]" : "text-white/90"
          )}
        >
          {match.awayTeam}
        </span>
      </div>
    </div>
  );
}