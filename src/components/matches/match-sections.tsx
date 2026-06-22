"use client";

import { memo, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { buildPreMatchCreateHref } from "@/lib/create/pre-match-fixture";
import { groupMatches } from "@/lib/football/group-matches";
import type { FootballMatch } from "@/types/match";
import { MatchSectionHeader } from "@/components/matches/match-section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const SECTION_SURFACE: Record<string, string> = {
  live: "rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-4 sm:p-5",
  finished: "rounded-2xl border border-white/6 bg-white/[0.02] p-4 sm:p-5",
  upcoming:
    "rounded-2xl border border-[#F4C542]/10 bg-[#F4C542]/[0.03] p-4 sm:p-5",
};

export const MatchSections = memo(function MatchSections({
  matches,
  renderCard,
  compact,
  finishedPreviewLimit,
  showLiveEmptyState,
}: {
  matches: FootballMatch[];
  renderCard: (
    match: FootballMatch,
    index: number,
    section: "live" | "finished" | "upcoming"
  ) => ReactNode;
  compact?: boolean;
  /** Match Center: show this many recent results before expanding */
  finishedPreviewLimit?: number;
  /** Match Center: empty live section with pre-match reaction CTA */
  showLiveEmptyState?: boolean;
}) {
  const [finishedExpanded, setFinishedExpanded] = useState(false);
  const { live, finished, upcoming } = groupMatches(matches);
  const preMatchCreateHref = useMemo(
    () => buildPreMatchCreateHref(upcoming[0]),
    [upcoming]
  );

  const sections: {
    key: "live" | "finished" | "upcoming";
    items: FootballMatch[];
    limit?: number;
  }[] = [
    { key: "live", items: live },
    { key: "finished", items: finished, limit: compact ? 2 : undefined },
    { key: "upcoming", items: upcoming, limit: compact ? 2 : undefined },
  ];

  let cardIndex = 0;

  return (
    <div className="space-y-14">
      {sections.map(({ key, items, limit }) => {
        const isLiveEmpty = key === "live" && items.length === 0 && showLiveEmptyState;
        if (items.length === 0 && !isLiveEmpty) return null;

        let slice = limit ? items.slice(0, limit) : items;
        let showFinishedMore = false;

        if (
          key === "finished" &&
          finishedPreviewLimit != null &&
          !compact &&
          !finishedExpanded &&
          items.length > finishedPreviewLimit
        ) {
          slice = items.slice(0, finishedPreviewLimit);
          showFinishedMore = true;
        }

        return (
          <section key={key} className={cn("space-y-5", SECTION_SURFACE[key])}>
            <MatchSectionHeader variant={key} count={items.length} />
            {isLiveEmpty ? (
              <div className="flex flex-col items-center gap-5 rounded-xl border border-red-500/15 bg-red-500/[0.04] px-6 py-12 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-red-500/25 bg-red-500/10">
                  <Radio className="h-6 w-6 text-red-200/80" />
                </div>
                <p className="max-w-md font-display text-xl leading-snug text-white/90 md:text-2xl">
                  No live match yet. Generate a pre-match fan reaction.
                </p>
                <Button asChild size="lg" className="shadow-md shadow-[#F4C542]/10">
                  <Link href={preMatchCreateHref}>Generate Pre-Match Reaction</Link>
                </Button>
              </div>
            ) : (
              <div
                className={
                  compact ? "grid gap-5 md:grid-cols-2" : "grid gap-6"
                }
              >
                {slice.map((m) => renderCard(m, cardIndex++, key))}
              </div>
            )}
            {showFinishedMore && (
              <div className="flex justify-center pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setFinishedExpanded(true)}
                  className="text-muted/70 hover:text-[#F4C542]/90"
                >
                  Show More ({items.length - slice.length} remaining)
                </Button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
});