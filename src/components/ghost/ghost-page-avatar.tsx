"use client";

import { useMemo } from "react";
import { motion } from "@/lib/motion";
import type { GhostTraits } from "@/types/ghost";
import type { GhostMemorySnapshot } from "@/lib/ghost/avatar-visual-profile";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import { buildPremiumGhostCardDataUri } from "@/lib/ghost/avatar-premium-card";
import { cn } from "@/lib/utils/cn";

/**
 * Premium player-card avatar used only on the My Ghost page.
 * Separate from GhostAvatar so other flows keep their existing visuals.
 */
export function GhostPageAvatar({
  name,
  team,
  teamCode,
  walletAddress,
  traits,
  mood,
  evolutionScore,
  confidence,
  memories,
  memorySummary,
  identity,
  size = 176,
  className,
  animate = true,
}: {
  name: string;
  team: string;
  teamCode?: string;
  walletAddress?: string;
  traits?: GhostTraits;
  mood?: string;
  evolutionScore?: number;
  confidence?: number;
  memories?: GhostMemorySnapshot[];
  memorySummary?: string;
  identity?: WalletIdentityProfile;
  size?: number;
  className?: string;
  animate?: boolean;
}) {
  const src = useMemo(
    () =>
      buildPremiumGhostCardDataUri({
        name,
        team,
        teamCode,
        walletAddress,
        traits,
        mood,
        evolutionScore,
        confidence,
        memories,
        memorySummary,
        identity,
      }),
    [
      name,
      team,
      teamCode,
      walletAddress,
      traits,
      mood,
      evolutionScore,
      confidence,
      memories,
      memorySummary,
      identity,
    ]
  );

  const height = Math.round(size * (168 / 120));

  const card = (
    // eslint-disable-next-line @next/next/no-img-element -- procedural premium card SVG
    <img
      src={src}
      alt={`${name} premium GoalGhost card`}
      width={size}
      height={height}
      className={cn(
        "rounded-2xl object-cover shadow-2xl shadow-black/40 ring-1 ring-white/10",
        className
      )}
      draggable={false}
    />
  );

  if (!animate) return card;

  return (
    <motion.div
      className="relative shrink-0"
      animate={{
        y: [0, -6, 0],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 12px 40px rgba(0,0,0,0.45), 0 0 24px rgba(244,197,66,0.08)",
            "0 16px 52px rgba(0,0,0,0.5), 0 0 36px rgba(244,197,66,0.18)",
            "0 12px 40px rgba(0,0,0,0.45), 0 0 24px rgba(244,197,66,0.08)",
          ],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-2xl"
      >
        {card}
      </motion.div>
      <motion.div
        className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-t from-[#F4C542]/0 via-[#F4C542]/5 to-transparent"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
    </motion.div>
  );
}