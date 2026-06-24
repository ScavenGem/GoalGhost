"use client";

import { useCallback } from "react";
import { useAccount } from "wagmi";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/lib/motion";
import { Radio, Heart, RefreshCw, Link2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MatchCard, teamFlagEmoji } from "@/components/matches/match-card";
import { MatchSections } from "@/components/matches/match-sections";
import type { MatchFeedSource } from "@/lib/football/match-feed-types";

import { FootballLoader } from "@/components/ui/football-loader";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { useMatchFeed } from "@/hooks/use-match-feed";
import { useEmojiReactionHandler } from "@/hooks/use-match-emoji-reactions";
import { useMatchReaction } from "@/hooks/use-match-reaction";
import { EMPTY_EMOJI_COUNTS } from "@/types/match-emoji-reaction";
import { hoverIconBtn, hoverLink } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";
const SOURCE_LABEL: Record<MatchFeedSource, string> = {
  "api-football": "API-Football · live",
  "football-data.org": "football-data.org · live",
};

export default function MatchesPage() {
  const { address } = useAccount();
  const { matches, source, fetchedAt, stale, loading, refreshing, loadMatches } =
    useMatchFeed({ poll: true });
  const { ghost, reacting, emojiReacting, toast, errorToast, reactToMatch, reactWithEmoji } =
    useMatchReaction();
  const { summaries, handleEmojiReact } = useEmojiReactionHandler(
    matches.map((m) => m.id),
    reactWithEmoji
  );

  const renderCard = useCallback(
    (
      m: (typeof matches)[number],
      i: number,
      section: "live" | "finished" | "upcoming"
    ) => {
      const emojiSummary = summaries[m.id] ?? {
        counts: { ...EMPTY_EMOJI_COUNTS },
        userReaction: null,
      };
      return (
        <MatchCard
          key={m.id}
          match={m}
          index={i}
          section={section}
          ghostTeam={ghost?.team}
          reacting={reacting === m.id}
          emojiReacting={
            emojiReacting?.matchId === m.id ? emojiReacting.reactionId : null
          }
          emojiCounts={emojiSummary.counts}
          userEmojiReaction={emojiSummary.userReaction}
          hasGhost={!!ghost}
          onReact={() => reactToMatch(m)}
          onEmojiReact={(reactionId) => handleEmojiReact(m, reactionId)}
        />
      );
    },
    [ghost, reacting, emojiReacting, summaries, handleEmojiReact, reactToMatch]
  );

  const liveCount = matches.filter((m) => m.status === "LIVE" || m.status === "PAUSED").length;

  return (
    <>
      <div className="relative mx-auto max-w-4xl space-y-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#F4C542]">FIFA World Cup</p>
            <h1 className="font-display text-4xl md:text-5xl">Match Center</h1>
            <p className="mt-2 max-w-lg leading-relaxed text-muted">
              Live kickoffs, late drama, and full-time heartbreak. Every reaction you feel
              becomes fan identity evolution verified on 0G Storage.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-200">
                <Radio className="h-3 w-3 animate-pulse" />
                {SOURCE_LABEL[source]}
              </span>
              {stale && (
                <span className="text-[10px] text-amber-200/60">cached feed</span>
              )}
              {fetchedAt && (
                <span className="text-[10px] text-muted/60">
                  Updated {new Date(fetchedAt).toLocaleTimeString()}
                </span>
              )}
              <button
                type="button"
                onClick={loadMatches}
                className={cn("text-muted", hoverIconBtn, "hover:text-[#F4C542]")}
                aria-label="Refresh matches"
              >
                {refreshing ? (
                  <GoalGhostLogo size={14} spin />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
          {liveCount > 0 && (
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 self-start rounded-full border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm text-red-100 sm:self-auto"
            >
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              {liveCount} live now
            </motion.div>
          )}
        </motion.div>

        {ghost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-[#F4C542]/20 bg-gradient-to-r from-[#F4C542]/8 to-transparent">
              <CardContent className="flex flex-wrap items-center gap-6 p-5 sm:gap-8 sm:p-6">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Your Ghost</p>
                  <p className="flex items-center gap-2.5 font-display text-xl text-[#F4C542]">
                    <span className="text-2xl leading-none" aria-hidden>
                      {teamFlagEmoji(ghost.team)}
                    </span>
                    {ghost.name}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Mood</p>
                  <p className="capitalize">{ghost.mood}</p>
                </div>
                <div className="min-w-[140px] flex-1">
                  <p className="mb-2 text-[10px] uppercase tracking-wider text-muted">Confidence</p>
                  <Progress value={ghost.confidence} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted">Evolution</p>
                  <p className="text-2xl font-semibold text-[#F4C542]">{ghost.evolutionScore}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!ghost && address && (
          <Card className="border-[#F4C542]/15">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted">Create a GoalGhost to feel every match with you.</p>
              <Link href="/create">
                <Button>Birth Your Ghost</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {errorToast && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100"
            >
              {errorToast}
            </motion.div>
          )}
          {toast && (
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className="fixed right-4 top-20 z-50 max-w-sm overflow-hidden rounded-2xl border border-[#F4C542]/30 bg-[#0A1020] shadow-2xl shadow-[#F4C542]/10 sm:right-8 sm:top-24"
            >
              <div className="h-1 bg-gradient-to-r from-[#F4C542] via-[#F4C542]/50 to-transparent" />
              <div className="p-5">
                <div className="flex items-center gap-2 text-[#F4C542]">
                  <Heart className="h-4 w-4" />
                  <p className="text-xs uppercase tracking-wider">{toast.mood}</p>
                </div>
                <p className="mt-2 font-display text-lg">{toast.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-4">
                  {toast.reaction}
                </p>

                {toast.memorySaved && (
                  <>
                    <p className="mt-2 text-[10px] text-emerald-300/80">
                      Sealed to mainnet 0G Storage
                      {toast.rootHash ? ` · ${toast.rootHash.slice(0, 10)}…` : ""}
                    </p>
                    <Link
                      href="/memories"
                      className={cn(
                        "mt-2 inline-flex items-center gap-1 text-xs text-[#F4C542]/80",
                        hoverLink
                      )}
                    >
                      <Link2 className="h-3 w-3" />
                      View in Fan Journey →
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading && matches.length === 0 ? (
          <FootballLoader label="Loading matches…" />
        ) : (
          <MatchSections
            matches={matches}
            renderCard={renderCard}
            finishedPreviewLimit={3}
            showLiveEmptyState
          />
        )}
      </div>
    </>
  );
}