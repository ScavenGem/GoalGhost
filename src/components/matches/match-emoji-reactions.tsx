"use client";

import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  MATCH_EMOJI_REACTIONS,
  type MatchEmojiReactionId,
} from "@/lib/match-reactions/types";
import type { MatchEmojiReactionCounts } from "@/types/match-emoji-reaction";
import { EMPTY_EMOJI_COUNTS } from "@/types/match-emoji-reaction";

export const MatchEmojiReactions = memo(function MatchEmojiReactions({
  matchId,
  disabled,
  reacting,
  userReaction,
  counts = EMPTY_EMOJI_COUNTS,
  onReact,
  compact,
}: {
  matchId: string;
  disabled?: boolean;
  reacting: MatchEmojiReactionId | null;
  userReaction?: MatchEmojiReactionId | null;
  counts?: MatchEmojiReactionCounts;
  onReact: (reactionId: MatchEmojiReactionId) => void;
  compact?: boolean;
}) {
  const [pendingPick, setPendingPick] = useState<MatchEmojiReactionId | null>(null);
  const selected = userReaction ?? pendingPick;
  const hasVoted = selected != null;

  useEffect(() => {
    if (userReaction != null) setPendingPick(null);
  }, [userReaction]);

  function handleReact(reactionId: MatchEmojiReactionId) {
    if (disabled || reacting != null) return;
    if (userReaction === reactionId) return;
    setPendingPick(reactionId);
    onReact(reactionId);
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        compact ? "gap-1" : "gap-1.5"
      )}
      role="group"
      aria-label="React to match"
    >
      {MATCH_EMOJI_REACTIONS.map((reaction) => {
        const isSigning = reacting === reaction.id;
        const isSelected = selected === reaction.id;
        const count = counts[reaction.id] ?? 0;

        return (
          <button
            key={`${matchId}-${reaction.id}`}
            type="button"
            title={
              isSelected ? `${reaction.label} · your reaction` : reaction.label
            }
            aria-label={`${reaction.label}${count > 0 ? `, ${count} reactions` : ""}${
              isSelected ? ", selected" : ""
            }`}
            aria-pressed={isSelected}
            aria-busy={isSigning}
            disabled={disabled}
            onClick={() => handleReact(reaction.id)}
            className={cn(
              "relative inline-flex items-center justify-center gap-1 rounded-full border",
              "transition-[transform,box-shadow,border-color,background-color,opacity] duration-150",
              compact ? "h-7 min-w-[2.1rem] px-1.5" : "h-8 min-w-[2.4rem] px-2",
              "disabled:cursor-not-allowed disabled:opacity-35",
              isSelected
                ? cn(
                    "z-[1] border-[#F4C542] bg-[#F4C542]/22",
                    "shadow-[0_0_16px_rgba(244,197,66,0.28)]",
                    compact ? "scale-[1.07]" : "scale-105"
                  )
                : cn(
                    "border-white/10 bg-white/[0.04]",
                    "hover:border-white/20 hover:bg-white/[0.07]",
                    hasVoted && "opacity-60 hover:opacity-100"
                  ),
              isSigning &&
                "ring-2 ring-[#F4C542]/40 ring-offset-1 ring-offset-[#0A1020]"
            )}
          >
            <span
              className={cn(
                "leading-none",
                compact ? "text-sm" : "text-base",
                isSelected && "drop-shadow-[0_0_8px_rgba(244,197,66,0.5)]"
              )}
              aria-hidden
            >
              {reaction.emoji}
            </span>
            {count > 0 && (
              <span
                className={cn(
                  "min-w-[0.7rem] text-center font-semibold tabular-nums leading-none",
                  compact ? "text-[9px]" : "text-[10px]",
                  isSelected ? "text-[#F4C542]" : "text-white/55"
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});