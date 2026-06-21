"use client";

import { memo } from "react";
import { motion } from "@/lib/motion";
import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MatchFaceoff } from "@/components/matches/match-faceoff";

import { GoalGhostAccent } from "@/components/ui/goalghost-logo";
import type { FootballMatch } from "@/types/match";
import { statusDisplayLabel } from "@/lib/football/status";
import { MatchEmojiReactions } from "@/components/matches/match-emoji-reactions";
import type { MatchEmojiReactionId } from "@/lib/match-reactions/types";
import type { MatchEmojiReactionCounts } from "@/types/match-emoji-reaction";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

export const HomeMatchCard = memo(function HomeMatchCard({
  match,
  index,
  ghostTeam,
  hasGhost,
  reacting,
  emojiReacting,
  emojiCounts,
  userEmojiReaction,
  onReact,
  onEmojiReact,
  section,
}: {
  match: FootballMatch;
  index: number;
  ghostTeam?: string;
  hasGhost: boolean;
  reacting: boolean;
  emojiReacting: MatchEmojiReactionId | null;
  emojiCounts?: MatchEmojiReactionCounts;
  userEmojiReaction?: MatchEmojiReactionId | null;
  onReact: () => void;
  onEmojiReact: (reactionId: MatchEmojiReactionId) => void;
  section?: "live" | "finished" | "upcoming";
}) {
  const isLive = match.status === "LIVE";
  const isPaused = match.status === "PAUSED";
  const active = isLive || isPaused;
  const teamPlaying =
    ghostTeam &&
    (ghostTeam === match.homeTeam || ghostTeam === match.awayTeam);
  const label = statusDisplayLabel(
    match.status,
    match.minute,
    match.utcDate,
    match.injuryTime
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.7 }}
      className="relative"
    >
      {isLive && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-px z-0 rounded-[inherit]"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(239, 68, 68, 0)",
              "0 0 18px 2px rgba(239, 68, 68, 0.15)",
              "0 0 0 0 rgba(239, 68, 68, 0)",
            ],
          }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <Card
        className={cn(
          "relative z-10 overflow-hidden transition-all duration-300",
          section === "live" &&
            "border-red-500/30 bg-gradient-to-br from-red-500/10 via-[#0A1020]/95 to-[#0A1020]",
          section === "finished" && "border-white/8 bg-[#0A1020]/80",
          section === "upcoming" &&
            "border-[#F4C542]/15 bg-gradient-to-br from-[#F4C542]/[0.04] to-[#0A1020]",
          teamPlaying && active && "ring-1 ring-[#F4C542]/30"
        )}
      >
        {active && (
          <motion.div
            className="h-0.5 bg-gradient-to-r from-red-500/80 via-[#F4C542]/60 to-transparent"
            animate={{ opacity: [0.35, 0.9, 0.35] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <p className="text-[10px] uppercase tracking-wider text-muted line-clamp-1">
            {match.competition}
          </p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
              active
                ? "bg-red-500/20 text-red-200"
                : match.status === "FINISHED"
                  ? "bg-white/8 text-muted"
                  : "bg-[#F4C542]/12 text-[#F4C542]"
            )}
          >
            {active && <Radio className="h-2.5 w-2.5 animate-pulse" />}
            {label}
          </span>
        </CardHeader>

        <CardContent className="space-y-4 pt-0">
          <MatchFaceoff match={match} ghostTeam={ghostTeam} compact />

          <div className="relative space-y-2 border-t border-white/6 pt-3">
            <GoalGhostAccent size={16} className="absolute right-3 top-1 opacity-35" />
            <MatchEmojiReactions
              matchId={match.id}
              compact
              disabled={!hasGhost}
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
                    "w-full font-medium",
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
                  className="w-full border-[#F4C542]/25 font-medium text-[#F4C542]/90 hover:bg-[#F4C542]/10"
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