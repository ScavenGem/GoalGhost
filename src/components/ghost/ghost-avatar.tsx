"use client";

import { useMemo, useState } from "react";
import { motion } from "@/lib/motion";
import { buildGhostAvatarDataUri } from "@/lib/ghost/avatar";
import { PREMIUM_CARD_ASPECT } from "@/lib/ghost/avatar-premium-card";
import { cn } from "@/lib/utils/cn";
import { GhostAvatarModal } from "@/components/ghost/ghost-avatar-modal";
import {
  ghostAvatarStage,
  type GhostAvatarProps,
} from "@/components/ghost/ghost-avatar-shared";

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
  expandable = true,
}: GhostAvatarProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const stage = ghostAvatarStage(evolutionScore);

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

  const height = Math.round(size * PREMIUM_CARD_ASPECT);

  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- procedural data-URI SVG avatars
    <img
      src={src}
      alt={`${name} GoalGhost avatar`}
      width={size}
      height={height}
      className={cn("block w-full rounded-[1.1rem] object-cover", className)}
      draggable={false}
    />
  );

  const wrapped = expandable ? (
    <button
      type="button"
      onClick={() => setModalOpen(true)}
      className={cn(
        "group relative shrink-0 cursor-zoom-in overflow-hidden rounded-[1.1rem]",
        "ring-1 ring-white/10 transition-all hover:ring-[#F4C542]/35",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F4C542]/50"
      )}
      aria-label={`View ${name} GoalGhost full size`}
    >
      {img}
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  ) : (
    <div className="relative shrink-0 overflow-hidden rounded-[1.1rem] ring-1 ring-white/10">
      {img}
    </div>
  );

  const body = animate ? (
    <motion.div
      animate={{
        y: [0, -6, 0],
        boxShadow: [
          "0 12px 40px rgba(0,0,0,0.45), 0 0 20px rgba(244,197,66,0.08)",
          "0 18px 52px rgba(0,0,0,0.5), 0 0 32px rgba(244,197,66,0.16)",
          "0 12px 40px rgba(0,0,0,0.45), 0 0 20px rgba(244,197,66,0.08)",
        ],
      }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative shrink-0"
      style={{ width: size }}
    >
      {wrapped}
    </motion.div>
  ) : (
    <div className="relative shrink-0" style={{ width: size }}>
      {wrapped}
    </div>
  );

  return (
    <>
      {body}
      {expandable && (
        <GhostAvatarModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          name={name}
          team={team}
          stage={stage}
          mood={mood}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`${name} GoalGhost full view`}
            className="block w-full object-cover"
            draggable={false}
          />
        </GhostAvatarModal>
      )}
    </>
  );
}