"use client";

import { useMemo } from "react";
import { motion } from "@/lib/motion";
import type { GhostTraits } from "@/types/ghost";
import { buildGhostAvatarDataUri } from "@/lib/ghost/avatar";
import { cn } from "@/lib/utils/cn";

export function GhostAvatar({
  name,
  team,
  teamCode,
  traits,
  mood,
  evolutionScore,
  memorySummary,
  size = 160,
  className,
  animate = false,
}: {
  name: string;
  team: string;
  teamCode?: string;
  traits?: GhostTraits;
  mood?: string;
  evolutionScore?: number;
  memorySummary?: string;
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
        traits,
        mood,
        evolutionScore,
        memorySummary,
      }),
    [name, team, teamCode, traits, mood, evolutionScore, memorySummary]
  );

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- procedural data-URI SVG avatars
    <img
      src={src}
      alt={`${name} GoalGhost avatar`}
      width={size}
      height={size}
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