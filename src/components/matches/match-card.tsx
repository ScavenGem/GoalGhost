"use client";

import { memo } from "react";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FootballMatch } from "@/types/match";
import {
  formatKickoff,
  formatLiveMinute,
  statusDisplayLabel,
} from "@/lib/football/status";
import { hoverCardSubtle } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";

import { GoalGhostAccent } from "@/components/ui/goalghost-logo";
import { MatchEmojiReactions } from "@/components/matches/match-emoji-reactions";
import type { MatchEmojiReactionId } from "@/lib/match-reactions/types";
import type { MatchEmojiReactionCounts } from "@/types/match-emoji-reaction";
import Link from "next/link";
import { Radio } from "lucide-react";

/** Hard-coded national flag emojis for Match Center: no images or external flag libs */
const FLAG_BY_NAME: Record<string, string> = {
  Algeria: "🇩🇿",
  Argentina: "🇦🇷",
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  "Bosnia-Herzegovina": "🇧🇦",
  Brazil: "🇧🇷",
  Cameroon: "🇨🇲",
  Canada: "🇨🇦",
  "Cape Verde": "🇨🇻",
  "Cape Verde Islands": "🇨🇻",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  "Congo DR": "🇨🇩",
  "Costa Rica": "🇨🇷",
  Croatia: "🇭🇷",
  Curaçao: "🇨🇼",
  Curacao: "🇨🇼",
  Czechia: "🇨🇿",
  Ecuador: "🇪🇨",
  Egypt: "🇪🇬",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Ghana: "🇬🇭",
  Haiti: "🇭🇹",
  Honduras: "🇭🇳",
  Iran: "🇮🇷",
  Iraq: "🇮🇶",
  Italy: "🇮🇹",
  "Ivory Coast": "🇨🇮",
  "Côte d'Ivoire": "🇨🇮",
  Jamaica: "🇯🇲",
  Japan: "🇯🇵",
  Jordan: "🇯🇴",
  Mexico: "🇲🇽",
  Morocco: "🇲🇦",
  Netherlands: "🇳🇱",
  "New Zealand": "🇳🇿",
  Nigeria: "🇳🇬",
  Norway: "🇳🇴",
  Panama: "🇵🇦",
  Paraguay: "🇵🇾",
  Peru: "🇵🇪",
  Poland: "🇵🇱",
  Portugal: "🇵🇹",
  Qatar: "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Senegal: "🇸🇳",
  Serbia: "🇷🇸",
  "South Africa": "🇿🇦",
  "South Korea": "🇰🇷",
  "Korea Republic": "🇰🇷",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Tunisia: "🇹🇳",
  Turkey: "🇹🇷",
  "United States": "🇺🇸",
  Uruguay: "🇺🇾",
  Uzbekistan: "🇺🇿",
  Venezuela: "🇻🇪",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

const FLAG_BY_CODE: Record<string, string> = {
  ALG: "🇩🇿",
  ARG: "🇦🇷",
  AUS: "🇦🇺",
  AUT: "🇦🇹",
  BEL: "🇧🇪",
  BIH: "🇧🇦",
  BRA: "🇧🇷",
  CMR: "🇨🇲",
  CAN: "🇨🇦",
  CPV: "🇨🇻",
  CHI: "🇨🇱",
  COL: "🇨🇴",
  COD: "🇨🇩",
  CRC: "🇨🇷",
  CRO: "🇭🇷",
  CUW: "🇨🇼",
  CZE: "🇨🇿",
  ECU: "🇪🇨",
  EGY: "🇪🇬",
  ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  FRA: "🇫🇷",
  GER: "🇩🇪",
  GHA: "🇬🇭",
  HAI: "🇭🇹",
  HON: "🇭🇳",
  IRN: "🇮🇷",
  IRQ: "🇮🇶",
  ITA: "🇮🇹",
  CIV: "🇨🇮",
  JAM: "🇯🇲",
  JPN: "🇯🇵",
  JOR: "🇯🇴",
  KOR: "🇰🇷",
  MAR: "🇲🇦",
  MEX: "🇲🇽",
  NED: "🇳🇱",
  NGA: "🇳🇬",
  NOR: "🇳🇴",
  NZL: "🇳🇿",
  PAN: "🇵🇦",
  PAR: "🇵🇾",
  PER: "🇵🇪",
  POL: "🇵🇱",
  POR: "🇵🇹",
  QAT: "🇶🇦",
  RSA: "🇿🇦",
  KSA: "🇸🇦",
  SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  SEN: "🇸🇳",
  SRB: "🇷🇸",
  ESP: "🇪🇸",
  SWE: "🇸🇪",
  SUI: "🇨🇭",
  TUN: "🇹🇳",
  TUR: "🇹🇷",
  USA: "🇺🇸",
  URU: "🇺🇾",
  UZB: "🇺🇿",
  VEN: "🇻🇪",
  WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
};

export function teamFlagEmoji(team: string, code?: string): string {
  if (code) {
    const byCode = FLAG_BY_CODE[code.toUpperCase()];
    if (byCode) return byCode;
  }

  const byName = FLAG_BY_NAME[team];
  if (byName) return byName;

  const normalized = team.toLowerCase();
  for (const [name, flag] of Object.entries(FLAG_BY_NAME)) {
    if (normalized === name.toLowerCase()) return flag;
    if (normalized.includes(name.toLowerCase())) return flag;
  }

  return "🏳️";
}

function twemojiFlagSrc(emoji: string): string {
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0))
    .filter((cp): cp is number => cp !== undefined)
    .map((cp) => cp.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoints}.png`;
}

function MatchCenterFlag({
  team,
  code,
  highlight,
  twemoji,
}: {
  team: string;
  code?: string;
  highlight?: boolean;
  twemoji?: boolean;
}) {
  const emoji = teamFlagEmoji(team, code);

  return (
    <span
      className={cn(
        "inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center leading-none",
        !twemoji && "text-[2.75rem]",
        highlight && "drop-shadow-[0_0_10px_rgba(244,197,66,0.4)]"
      )}
      aria-hidden
    >
      {twemoji ? (
        // Same Twemoji rendering as Create / Nation selection page
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={twemojiFlagSrc(emoji)}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11"
          draggable={false}
        />
      ) : (
        emoji
      )}
    </span>
  );
}

function MatchCenterFaceoff({
  match,
  ghostTeam,
  twemoji,
}: {
  match: FootballMatch;
  ghostTeam?: string;
  twemoji?: boolean;
}) {
  const isScheduled = match.status === "SCHEDULED";
  const isFinished = match.status === "FINISHED";
  const isActive = match.status === "LIVE" || match.status === "PAUSED";
  const homeHighlight = !!ghostTeam && ghostTeam === match.homeTeam;
  const awayHighlight = !!ghostTeam && ghostTeam === match.awayTeam;

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <MatchCenterFlag
          team={match.homeTeam}
          code={match.homeTeamCode}
          highlight={homeHighlight}
          twemoji={twemoji}
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
        <MatchCenterFlag
          team={match.awayTeam}
          code={match.awayTeamCode}
          highlight={awayHighlight}
          twemoji={twemoji}
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

export const MatchCard = memo(function MatchCard({
  match,
  index,
  ghostTeam,
  reacting,
  emojiReacting,
  emojiCounts,
  userEmojiReaction,
  hasGhost,
  onReact,
  onEmojiReact,
  section,
}: {
  match: FootballMatch;
  index: number;
  ghostTeam?: string;
  reacting: boolean;
  emojiReacting: MatchEmojiReactionId | null;
  emojiCounts?: MatchEmojiReactionCounts;
  userEmojiReaction?: MatchEmojiReactionId | null;
  hasGhost: boolean;
  onReact: () => void;
  onEmojiReact: (reactionId: MatchEmojiReactionId) => void;
  section?: "live" | "finished" | "upcoming";
}) {
  const teamPlaying =
    ghostTeam &&
    (ghostTeam === match.homeTeam || ghostTeam === match.awayTeam);
  const isLive = match.status === "LIVE";
  const isPaused = match.status === "PAUSED";
  const active = isLive || isPaused;
  const label = statusDisplayLabel(
    match.status,
    match.minute,
    match.utcDate,
    match.injuryTime
  );
  const progressPct =
    match.minute != null ? Math.min(100, (match.minute / 90) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="relative"
    >
      {isLive && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px z-0 rounded-[inherit]"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(239, 68, 68, 0)",
              "0 0 22px 3px rgba(239, 68, 68, 0.18)",
              "0 0 0 0 rgba(239, 68, 68, 0)",
            ],
          }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <Card
        className={cn(
          "relative z-10 overflow-hidden",
          hoverCardSubtle,
          section === "live" &&
            "border-red-500/30 bg-gradient-to-br from-red-500/10 via-[#0A1020]/95 to-[#0A1020]",
          section === "finished" &&
            "border-white/8 bg-[#0A1020]/80",
          section === "upcoming" &&
            "border-[#F4C542]/15 bg-gradient-to-br from-[#F4C542]/[0.04] to-[#0A1020]",
          !section && isLive &&
            "animate-live-breathe border-red-500/35 bg-gradient-to-r from-red-500/12 via-[#0A1020]/80 to-transparent shadow-lg shadow-red-500/8",
          !section && isPaused &&
            "border-amber-500/25 bg-gradient-to-r from-amber-500/8 via-[#0A1020]/80 to-transparent",
          teamPlaying && active && "ring-1 ring-[#F4C542]/35"
        )}
      >
        {active && (
          <>
            <motion.div
              className="h-0.5 bg-gradient-to-r from-red-500 via-[#F4C542] to-transparent"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            {match.minute != null && (
              <div className="h-1 bg-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500/80 to-[#F4C542]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            )}
          </>
        )}

        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-muted">
            {match.competition}
          </p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium",
              active
                ? "bg-red-500/25 text-red-200"
                : match.status === "FINISHED"
                  ? "bg-white/10 text-muted"
                  : "bg-[#F4C542]/15 text-[#F4C542]"
            )}
          >
            {active && <Radio className="h-2.5 w-2.5 animate-pulse" />}
            {label}
          </span>
        </CardHeader>

        <CardContent className="space-y-5 pt-0">
          <MatchCenterFaceoff
            match={match}
            ghostTeam={ghostTeam}
            twemoji
          />

          {teamPlaying && (
            <p className="text-center text-xs text-[#F4C542]/80">
              Your nation is on the pitch
            </p>
          )}

          <div className="relative flex flex-col items-center gap-2 border-t border-white/6 pt-4">
            <GoalGhostAccent size={18} className="absolute right-[18%] top-2 opacity-40" />
            <MatchEmojiReactions
              matchId={match.id}
              reacting={emojiReacting}
              userReaction={userEmojiReaction}
              counts={emojiCounts}
              onReact={onEmojiReact}
            />
            {hasGhost ? (
              <>
                <Button
                  size="sm"
                  variant={active ? "default" : "outline"}
                  disabled={reacting}
                  onClick={onReact}
                  className={cn(
                    "min-w-[200px] font-medium",
                    active && "shadow-md shadow-[#F4C542]/15"
                  )}
                >
                  {reacting ? "Feeling on 0G Compute…" : "Feel This Match"}
                </Button>
              </>
            ) : (
              <Link href="/create">
                <Button
                  size="sm"
                  variant="outline"
                  className="min-w-[200px] border-[#F4C542]/25 font-medium text-[#F4C542]/90 hover:bg-[#F4C542]/10"
                >
                  Feel This Match
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});