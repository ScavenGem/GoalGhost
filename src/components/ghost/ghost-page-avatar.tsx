"use client";

import { useMemo } from "react";
import { motion } from "@/lib/motion";
import type { GhostTraits } from "@/types/ghost";
import type { GhostMemorySnapshot } from "@/lib/ghost/avatar-visual-profile";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import {
  buildPremiumGhostCardDataUri,
  PREMIUM_CARD_ASPECT,
} from "@/lib/ghost/avatar-premium-card";
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

  const height = Math.round(size * PREMIUM_CARD_ASPECT);

  const card = (
    // eslint-disable-next-line @next/next/no-img-element -- procedural premium card SVG
    <img
      src={src}
      alt={`${name} premium GoalGhost player card`}
      width={size}
      height={height}
      className={cn(
        "block w-full rounded-[1.1rem] object-cover",
        className
      )}
      draggable={false}
    />
  );

  if (!animate) {
    return (
      <div className="relative shrink-0 overflow-hidden rounded-[1.1rem] shadow-2xl shadow-black/50 ring-1 ring-white/15">
        {card}
      </div>
    );
  }

  return (
    <motion.div
      className="relative shrink-0"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 16px 48px rgba(0,0,0,0.55), 0 0 28px rgba(153,69,255,0.06), 0 0 20px rgba(244,197,66,0.06)",
            "0 22px 60px rgba(0,0,0,0.6), 0 0 40px rgba(153,69,255,0.12), 0 0 32px rgba(244,197,66,0.14)",
            "0 16px 48px rgba(0,0,0,0.55), 0 0 28px rgba(153,69,255,0.06), 0 0 20px rgba(244,197,66,0.06)",
          ],
        }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="overflow-hidden rounded-[1.1rem] ring-1 ring-white/15"
      >
        {card}
      </motion.div>
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[1.1rem] bg-gradient-to-br from-[#9945FF]/8 via-transparent to-[#14F195]/6"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[1.1rem] bg-gradient-to-t from-[#F4C542]/0 via-transparent to-white/5"
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
    </motion.div>
  );
}