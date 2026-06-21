"use client";

import { memo, type ReactNode } from "react";
import { groupMatches } from "@/lib/football/group-matches";
import type { FootballMatch } from "@/types/match";
import { MatchSectionHeader } from "@/components/matches/match-section-header";
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
}: {
  matches: FootballMatch[];
  renderCard: (
    match: FootballMatch,
    index: number,
    section: "live" | "finished" | "upcoming"
  ) => ReactNode;
  compact?: boolean;
}) {
  const { live, finished, upcoming } = groupMatches(matches);

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
        if (items.length === 0) return null;
        const slice = limit ? items.slice(0, limit) : items;

        return (
          <section key={key} className={cn("space-y-5", SECTION_SURFACE[key])}>
            <MatchSectionHeader variant={key} count={items.length} />
            <div
              className={
                compact ? "grid gap-5 md:grid-cols-2" : "grid gap-6"
              }
            >
              {slice.map((m) => renderCard(m, cardIndex++, key))}
            </div>
          </section>
        );
      })}
    </div>
  );
});