"use client";

import { useMemo } from "react";
import { motion } from "@/lib/motion";
import type { GhostTraits } from "@/types/ghost";
import {
  buildGhostAvatarDataUri,
  type GhostMemorySnapshot,
} from "@/lib/ghost/avatar";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import { cn } from "@/lib/utils/cn";

export function GhostAvatar({
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
  size = 160,
  className,
  animate = false,
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
      buildGhostAvatarDataUri({
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

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- procedural data-URI SVG avatars
    <img
      src={src}
      alt={`${name} GoalGhost avatar`}
      width={size}
      height={Math.round(size * 1.4)}
      className={cn("rounded-3xl object-cover", className)}
      draggable={false}
    />
  );

  if (!animate) return img;

  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
        boxShadow: [
          "0 8px 32px rgba(244,197,66,0.12)",
          "0 12px 48px rgba(244,197,66,0.28)",
          "0 8px 32px rgba(244,197,66,0.12)",
        ],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative shrink-0"
    >
      {img}
    </motion.div>
  );
}