"use client";

import { useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { motion } from "@/lib/motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MemoryCard, type MemoryCardData } from "@/components/memories/memory-card";
import { OG_NETWORK } from "@/lib/0g/network";
import { FootballMotion } from "@/components/memories/football-motion";
import { PageHeader } from "@/components/layout/page-header";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { OgIrreplaceableBanner } from "@/components/0g/og-irreplaceable-banner";
import { MEMORY_ADDED_EVENT } from "@/lib/events/memory-sync";
import { useGhost, type GhostApiRecord } from "@/hooks/use-ghost";

function groupByDate(memories: MemoryCardData[]): { date: string; items: MemoryCardData[] }[] {
  const groups = new Map<string, MemoryCardData[]>();
  for (const m of memories) {
    const key = new Date(m.occurredAt).toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const list = groups.get(key) ?? [];
    list.push(m);
    groups.set(key, list);
  }
  return Array.from(groups.entries()).map(([date, items]) => ({ date, items }));
}

function toMemoryCards(memories: GhostApiRecord["memories"]): MemoryCardData[] {
  if (!memories?.length) return [];
  return memories
    .filter(
      (m): m is typeof m & { eventId: string; rootHash: string; occurredAt: string; type: string } =>
        !!m.eventId && !!m.rootHash && !!m.occurredAt && !!m.type
    )
    .map((m) => ({
      eventId: m.eventId,
      type: m.type,
      title: m.title,
      content: m.content,
      emotionalTone: m.emotionalTone,
      rootHash: m.rootHash,
      occurredAt: m.occurredAt,
    }))
    .sort(
      (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
    );
}

export default function MemoriesPage() {
  const { address } = useAccount();
  const { ghost, isFetching, invalidate } = useGhost(address);

  useEffect(() => {
    const onMemoryAdded = () => void invalidate();
    window.addEventListener(MEMORY_ADDED_EVENT, onMemoryAdded);
    return () => window.removeEventListener(MEMORY_ADDED_EVENT, onMemoryAdded);
  }, [invalidate]);

  const memories = useMemo(() => toMemoryCards(ghost?.memories), [ghost?.memories]);
  const ghostName = ghost?.name ?? null;
  const refreshing = isFetching && !!ghost;

  const grouped = useMemo(() => groupByDate(memories), [memories]);
  const milestones = memories.filter((m) => m.type === "milestone").length;
  const reactions = memories.filter((m) => m.type === "match_reaction").length;

  if (!address) {
    return (
      <div className="mx-auto max-w-lg py-32 text-center">
        <p className="font-display text-3xl text-muted">Connect your wallet</p>
        <p className="mt-3 text-sm text-muted/80">
          Your legacy encrypts to your keys, not our database.
        </p>
      </div>
    );
  }

  let cardIndex = 0;

  return (
    <>
      <div className="relative mx-auto max-w-3xl space-y-10 pb-16">
        <FootballMotion />

        <PageHeader
          eyebrow="The proof layer"
          title="Fan Journey"
          description={
            ghostName
              ? `Every moment ${ghostName} felt, from first kickoff through extra time to legacy, in chronological order. Each evolution chapter is verified on 0G Storage.`
              : "Chronological fan journey. Each evolution is verifiable proof on 0G Storage."
          }
        />
        {refreshing && (
          <p className="text-center text-xs text-[#F4C542]/60">Refreshing journey…</p>
        )}

        <OgIrreplaceableBanner compact />

        {memories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative grid grid-cols-3 gap-3 rounded-2xl border border-[#F4C542]/15 bg-[#0A1020]/80 p-6 backdrop-blur-sm"
          >
            {[
              { label: "Total moments", value: memories.length },
              { label: "Birth & milestones", value: milestones },
              { label: "Kickoffs felt", value: reactions },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="text-center"
              >
                <p className="font-display text-3xl text-[#F4C542]">{stat.value}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-muted">
                  {stat.label}
                </p>
              </motion.div>
            ))}
            <p className="absolute -top-3 left-6 rounded-full border border-[#F4C542]/20 bg-[#0A1020] px-3 py-0.5 text-[10px] uppercase tracking-wider text-[#F4C542]/80">
              Earliest → Latest
            </p>
          </motion.div>
        )}

        {memories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 rounded-3xl border border-white/8 bg-[#0A1020]/50 py-28 text-center"
          >
            <motion.div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#F4C542]/20 bg-[#F4C542]/[0.04]"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <GoalGhostLogo size={46} />
            </motion.div>
            <p className="font-display text-3xl text-foreground/85">Pre-match silence</p>
            <p className="mx-auto max-w-sm text-sm text-muted">
              Birth your ghost, then feel your first kickoff. Every reaction builds your fan identity here,
              verified on mainnet 0G Storage.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/create">
                <Button size="lg">Birth Your GoalGhost</Button>
              </Link>
              <Link href="/matches">
                <Button variant="outline" size="lg">
                  Match Center
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="relative">
            <div className="absolute bottom-0 left-[1.5rem] top-0 w-px bg-gradient-to-b from-[#F4C542]/70 via-[#F4C542]/20 to-transparent" />

            {grouped.map((group, gi) => (
              <div key={group.date} className="relative">
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: gi * 0.1 }}
                  className="mb-6 pl-16"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#F4C542]/70">
                    {group.date}
                  </p>
                </motion.div>

                {group.items.map((m) => {
                  const idx = cardIndex++;
                  return <MemoryCard key={m.eventId} memory={m} index={idx} sequence={idx + 1} />;
                })}
              </div>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: memories.length * 0.07 + 0.3 }}
              className="pl-16 pt-4 text-center text-xs text-muted/50"
            >
              {memories.length} moment{memories.length !== 1 ? "s" : ""} · chronological proof ·{" "}
              <a
                href={OG_NETWORK.storageExplorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4C542]/60 hover:text-[#F4C542]"
              >
                verify on 0G Storage Scan
              </a>
            </motion.p>
          </div>
        )}
      </div>
    </>
  );
}