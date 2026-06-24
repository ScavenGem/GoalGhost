"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "@/lib/motion";
import { useGhost } from "@/hooks/use-ghost";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { storageScanUrl } from "@/lib/0g/network";
import { ExternalLink, Radio, Sparkles } from "lucide-react";

import { EvolutionArc } from "@/components/ghost/evolution-arc";
import { FootballLoader } from "@/components/ui/football-loader";
import { OgIrreplaceableBanner } from "@/components/0g/og-irreplaceable-banner";
import { GhostAvatar } from "@/components/ghost/ghost-avatar";
import { NationFlagEmoji } from "@/components/ui/nation-flag-emoji";
import { nationByName } from "@/lib/football/teams";
import { hoverLink } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";
import {
  assertFreshMainnetWalletBalance,
  ensureLegacyComputeSubAccount,
  legacyInitMessage,
  type LegacyInitPhase,
} from "@/lib/0g/compute/ensure-legacy-sub-account";
import { gatherEvolveContext } from "@/lib/ghost/evolve-context";

type GhostData = {
  name: string;
  team: string;
  evolutionScore: number;
  confidence: number;
  mood: string;
  profileRoot: string;
  tokenId: number;
  memories?: { eventId: string; title?: string; type: string; occurredAt: string }[];
};

function evolutionStage(score: number): string {
  if (score >= 80) return "Legend";
  if (score >= 50) return "Veteran";
  if (score >= 25) return "Awakened";
  if (score > 0) return "Growing";
  return "Newborn";
}

export default function GhostPage() {
  const { address } = useAccount();
  const { ghost, isLoading: fetching, refetch, invalidate } = useGhost(address);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [evolveError, setEvolveError] = useState<string | null>(null);
  const [initPhase, setInitPhase] = useState<LegacyInitPhase | null>(null);

  useEffect(() => {
    if (!address || ghost || fetching) return;
    void refetch();
  }, [address, ghost, fetching, refetch]);

  function evolveInitMessage(phase: LegacyInitPhase | null): string | null {
    if (!phase) return null;
    if (phase === "generating") {
      return "Evolving your narrative with 0G Compute…";
    }
    return legacyInitMessage(phase);
  }

  async function evolve() {
    if (!ghost || !address) return;
    setLoading(true);
    setEvolveError(null);

    try {
      await assertFreshMainnetWalletBalance(address);
      await ensureLegacyComputeSubAccount(setInitPhase);
      setInitPhase("generating");

      const recentMemories = await gatherEvolveContext(address, ghost);
      const res = await fetch("/api/compute/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ghost: {
            name: ghost.name,
            team: ghost.team,
            evolutionScore: ghost.evolutionScore,
            mood: ghost.mood,
            recentMemories,
          },
        }),
      });

      const data = (await res.json()) as {
        evolution?: { narrative?: string };
        error?: string;
      };

      if (!res.ok || !data.evolution?.narrative?.trim()) {
        throw new Error(data.error ?? "0G Compute returned no evolution narrative");
      }

      setNarrative(data.evolution.narrative);
      void invalidate();
    } catch (e) {
      setEvolveError(
        e instanceof Error ? e.message : "Failed to evolve narrative"
      );
    } finally {
      setInitPhase(null);
      setLoading(false);
    }
  }

  if (!address) {
    return (
      <div className="mx-auto max-w-lg py-32 text-center">
        <p className="font-display text-3xl text-muted">Connect your wallet</p>
        <p className="mt-3 text-sm text-muted/80">Your ghost lives on 0G, owned by your keys alone.</p>
      </div>
    );
  }

  if (fetching) {
    return <FootballLoader label="Your ghost is taking the pitch…" prominent />;
  }

  if (!ghost) {
    return (
      <div className="mx-auto max-w-md space-y-6 py-32 text-center">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="mx-auto text-6xl"
        >
          👻
        </motion.div>
        <p className="font-display text-3xl">No ghost yet</p>
        <p className="text-muted">
          Birth your GoalGhost: a fan identity that carries your form, rivalry, and legacy through every match.
        </p>
        <Link href="/create">
          <Button size="lg">Birth Your GoalGhost</Button>
        </Link>
      </div>
    );
  }

  const memoryCount = ghost.memories?.length ?? 0;
  const stage = evolutionStage(ghost.evolutionScore);
  const latestMemory = ghost.memories?.[ghost.memories.length - 1];

  return (
    <>
      <div className="relative mx-auto max-w-3xl space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-10 md:flex-row md:items-start"
        >
          <div className="relative mx-auto sm:mx-0">
            <GhostAvatar
              name={ghost.name}
              team={ghost.team}
              mood={ghost.mood}
              evolutionScore={ghost.evolutionScore}
              memorySummary={ghost.memories?.map((m) => m.title).filter(Boolean).join("; ")}
              size={176}
              animate
            />
            <motion.span
              className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-[#F4C542]"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>

          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.35em] text-[#F4C542]">Your football identity</p>
            <h1 className="mt-2 font-display text-4xl md:text-5xl">{ghost.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="flex items-center gap-2.5 text-muted">
                <NationFlagEmoji
                  name={ghost.team}
                  code={nationByName(ghost.team)?.code}
                  size={28}
                />
                {ghost.team}
              </p>
              <motion.span
                className="rounded-full border border-[#F4C542]/30 bg-[#F4C542]/10 px-3 py-0.5 text-xs capitalize text-[#F4C542]"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {ghost.mood}
              </motion.span>
              <span className="rounded-full border border-white/10 px-3 py-0.5 text-xs text-muted">
                {stage}
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Mood", value: ghost.mood, accent: true },
                { label: "Evolution", value: ghost.evolutionScore, accent: true },
                { label: "Confidence", value: `${ghost.confidence}%`, accent: false },
                { label: "Evolution chapters", value: memoryCount, accent: true },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-white/8 bg-[#0A1020]/50 p-4"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted">{stat.label}</p>
                  <p
                    className={`mt-1 text-xl font-semibold capitalize ${stat.accent ? "text-[#F4C542]" : ""}`}
                  >
                    {stat.value}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6">
              <EvolutionArc score={ghost.evolutionScore} stage={stage} />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs text-muted">
                <span>Confidence</span>
                <span>{ghost.confidence}%</span>
              </div>
              <Progress value={ghost.confidence} />
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/matches">
            <Card interactive className="h-full border-white/8">
              <CardContent className="flex items-center gap-3 p-5">
                <Radio className="h-5 w-5 text-[#F4C542]" />
                <span className="text-sm font-medium">Feel the next kickoff</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/memories">
            <Card interactive className="h-full border-white/8">
              <CardContent className="flex items-center gap-3 p-5">
                <span className="text-sm font-medium">Fan Journey</span>
              </CardContent>
            </Card>
          </Link>
          <Link href="/legacy">
            <Card interactive className="h-full border-white/8">
              <CardContent className="flex items-center gap-3 p-5">
                <Sparkles className="h-5 w-5 text-[#F4C542]" />
                <span className="text-sm font-medium">Your Legacy</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Link href="/matches">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-2xl border border-[#F4C542]/20 bg-gradient-to-r from-[#F4C542]/10 to-transparent p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#F4C542]">
                  Build momentum match by match
                </p>
                <p className="mt-1 font-display text-lg">Feel a match → grow your legacy</p>
                <p className="mt-1 text-sm text-muted">
                  Every comeback, clean sheet, and heartbreak writes your fan identity evolution on 0G Storage.
                </p>
              </div>
              <Radio className="h-8 w-8 shrink-0 text-[#F4C542]" />
            </div>
          </motion.div>
        </Link>

        <OgIrreplaceableBanner compact />

        {latestMemory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/8 bg-[#0A1020]/50 p-5"
          >
            <p className="text-[10px] uppercase tracking-wider text-muted">Latest evolution</p>
            <p className="mt-1 font-display text-lg">{latestMemory.title ?? "A moment felt"}</p>
            <Link href="/memories" className={cn("mt-2 inline-block text-xs text-[#F4C542]/80", hoverLink)}>
              View full fan journey →
            </Link>
          </motion.div>
        )}

        <Card className="border-[#F4C542]/15 bg-surface/40">
          <CardHeader>
            <CardTitle className="font-display text-2xl">
              Who Is Your GoalGhost Becoming?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {narrative ? (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg leading-relaxed text-foreground/90"
              >
                {narrative}
              </motion.p>
            ) : (
              <p className="text-muted">
                Narrate your ghost&apos;s transformation, powered by 0G Compute.
              </p>
            )}
            {evolveInitMessage(initPhase) && (
              <p className="text-sm text-[#F4C542]/90">
                {evolveInitMessage(initPhase)}
              </p>
            )}
            {evolveError && (
              <p className="text-sm text-red-400/90">{evolveError}</p>
            )}
            <Button onClick={evolve} disabled={loading} variant="outline">
              {loading ? "Evolving…" : "Evolve Narrative"}
            </Button>
          </CardContent>
        </Card>

        {ghost.profileRoot && (
          <div className="space-y-3">
            <a
              href={storageScanUrl(ghost.profileRoot)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 font-mono text-xs text-muted/50",
                hoverLink
              )}
            >
              Profile · {ghost.profileRoot.slice(0, 24)}…
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </>
  );
}