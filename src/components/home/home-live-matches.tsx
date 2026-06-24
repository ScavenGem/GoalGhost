"use client";

import { useCallback } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useAccount } from "wagmi";
import { useMatchFeed } from "@/hooks/use-match-feed";
import { useEmojiReactionHandler } from "@/hooks/use-match-emoji-reactions";
import { useMatchReaction } from "@/hooks/use-match-reaction";
import { EMPTY_EMOJI_COUNTS } from "@/types/match-emoji-reaction";
import { cn } from "@/lib/utils/cn";
import { HomeMatchCard } from "@/components/home/home-match-card";
import { MatchSections } from "@/components/matches/match-sections";
import { FootballLoader } from "@/components/ui/football-loader";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { hoverIconBtn, hoverLink } from "@/lib/utils/hover";
import type { FootballMatch } from "@/types/match";

export function HomeLiveMatches() {
  const { address } = useAccount();
  const { matches, stale, loading, refreshing, loadMatches } = useMatchFeed({
    poll: true,
  });
  const { ghost, reacting, emojiReacting, reactToMatch, reactWithEmoji } =
    useMatchReaction();
  const { summaries, handleEmojiReact } = useEmojiReactionHandler(
    matches.map((m) => m.id),
    reactWithEmoji
  );

  const renderCard = useCallback(
    (m: FootballMatch, index: number, section: "live" | "finished" | "upcoming") => {
      const emojiSummary = summaries[m.id] ?? {
        counts: { ...EMPTY_EMOJI_COUNTS },
        userReaction: null,
      };
      return (
        <HomeMatchCard
          key={m.id}
          match={m}
          index={index}
          section={section}
          ghostTeam={ghost?.team}
          hasGhost={!!ghost}
          reacting={reacting === m.id}
          emojiReacting={
            emojiReacting?.matchId === m.id ? emojiReacting.reactionId : null
          }
          emojiCounts={emojiSummary.counts}
          userEmojiReaction={emojiSummary.userReaction}
          onReact={() => reactToMatch(m)}
          onEmojiReact={(reactionId) => handleEmojiReact(m, reactionId)}
        />
      );
    },
    [ghost, reacting, emojiReacting, summaries, handleEmojiReact, reactToMatch]
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
            FIFA World Cup
          </p>
          <h2 className="mt-1 font-display text-xl text-white/90 md:text-2xl">
            The Pitch Right Now
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {stale && (
            <span className="text-[10px] text-muted/60">cached feed</span>
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
          <Link
            href="/matches"
            className={cn("text-sm text-[#F4C542]", hoverLink, "hover:opacity-80")}
          >
            Match Center →
          </Link>
        </div>
      </div>

      {loading && matches.length === 0 ? (
        <FootballLoader label="No live match yet. Generate a pre-match fan reaction." />
      ) : (
        <MatchSections matches={matches} renderCard={renderCard} compact />
      )}
    </div>
  );
}