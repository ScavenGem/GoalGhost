"use client";

import { useEffect } from "react";
import { motion } from "@/lib/motion";
import { prepareEciesSealUpload } from "@/lib/0g/storage/browser-signer";
import { Sparkles, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GhostTraits, OgComputeProof } from "@/types/ghost";

import { GhostAvatar } from "@/components/ghost/ghost-avatar";
import { NationFlagEmoji } from "@/components/ui/nation-flag-emoji";
import { nationByName } from "@/lib/football/teams";

type GhostRevealProps = {
  name: string;
  backstory: string;
  voice: string;
  mood: string;
  traits: GhostTraits;
  team: string;
  computeProof?: OgComputeProof;
  sealLabel?: string;
  onMint: () => void;
};

const TRAIT_KEYS: (keyof GhostTraits)[] = [
  "passion",
  "loyalty",
  "drama",
  "hope",
  "resilience",
];

export function GhostReveal({
  name,
  backstory,
  voice,
  mood,
  traits,
  team,
  computeProof,
  sealLabel = "Encrypt to 0G Storage & Mint Agentic ID",
  onMint,
}: GhostRevealProps) {
  useEffect(() => {
    void prepareEciesSealUpload();
  }, []);

  const primeSealCredentials = () => {
    void prepareEciesSealUpload();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 90, damping: 18 }}
    >
      <Card className="overflow-hidden border-[#F4C542]/30 bg-gradient-to-b from-surface/90 to-[#0A1020]/90">
        <motion.div
          className="h-1 bg-gradient-to-r from-transparent via-[#F4C542] to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />

        <CardHeader className="space-y-3 pb-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <GhostAvatar
              name={name}
              team={team}
              traits={traits}
              mood={mood}
              size={120}
              animate
            />
            <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.25em] text-[#F4C542]/80">
            Your ghost has awakened
          </p>
          <CardTitle className="font-display text-4xl leading-tight text-[#F4C542] md:text-5xl">
            {name}
          </CardTitle>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-[#F4C542]/25 bg-[#F4C542]/10 px-3 py-1 capitalize text-[#F4C542]">
              {mood}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-muted">
              <NationFlagEmoji name={team} code={nationByName(team)?.code} size={24} />
              {team}
            </span>
          </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-lg leading-relaxed text-foreground/90">{backstory}</p>

          <blockquote className="border-l-2 border-[#F4C542]/50 pl-5">
            <p className="font-display text-lg italic text-[#F4C542]/90">
              &ldquo;{voice}&rdquo;
            </p>
          </blockquote>

          <div className="grid grid-cols-5 gap-2">
            {TRAIT_KEYS.map((key, i) => (
              <motion.div
                key={key}
                className="rounded-lg border border-white/8 bg-[#0A1020]/60 p-2 text-center"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
              >
                <p className="text-[10px] uppercase text-muted">{key.slice(0, 4)}</p>
                <p className="mt-1 text-sm font-semibold text-[#F4C542]">{traits[key]}</p>
              </motion.div>
            ))}
          </div>

          {computeProof?.fallback ? (
            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
              <p className="font-medium">Labeled fallback identity (0G Compute unavailable)</p>
              {computeProof.fallbackReason && (
                <p className="mt-1 text-[11px] text-amber-100/70">
                  {computeProof.fallbackReason}
                </p>
              )}
              <p className="mt-1 text-[11px] text-amber-100/60">
                You can still seal to 0G Storage and mint. Live TEE inference was not used for
                this draft.
              </p>
            </div>
          ) : computeProof?.teeVerified ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              TEE-verified 0G Compute inference
            </div>
          ) : null}
          <Button
            onClick={onMint}
            onMouseEnter={primeSealCredentials}
            onFocus={primeSealCredentials}
            size="lg"
            className="w-full shadow-lg shadow-[#F4C542]/10"
          >
            <Lock className="mr-2 h-4 w-4" />
            {sealLabel}
          </Button>

        </CardContent>
      </Card>
    </motion.div>
  );
}