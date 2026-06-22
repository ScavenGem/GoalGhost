"use client";

import { motion } from "@/lib/motion";

import { GhostAvatar } from "@/components/ghost/ghost-avatar";
import type { GhostTraits } from "@/types/ghost";

const RITUAL_LINES = [
  "Consulting 0G Compute providers…",
  "Forging name from football lore…",
  "Weaving backstory into fan identity…",
  "Calibrating mood and voice…",
  "The ghost is almost awake…",
];

const SPARKS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: (i % 4) * 25 + 10,
  delay: i * 0.2,
}));

export function BirthRitual({
  team,
  teamCode,
  traits,
}: {
  team?: string;
  teamCode?: string;
  traits?: GhostTraits;
}) {
  return (
    <motion.div
      className="relative flex flex-col items-center overflow-hidden py-20 sm:py-28"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {SPARKS.map((s) => (
        <motion.span
          key={s.id}
          className="pointer-events-none absolute text-[#F4C542]/40"
          style={{ left: `${s.x}%`, bottom: "20%" }}
          animate={{ y: [0, -120, -200], opacity: [0, 0.8, 0], scale: [0.5, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: s.delay }}
        >
          ✦
        </motion.span>
      ))}

      <div className="relative">
        <motion.div
          className="absolute inset-0 rounded-full bg-[#F4C542]/20 blur-2xl"
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="relative h-32 w-32 rounded-full border border-[#F4C542]/30 sm:h-36 sm:w-36"
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-5 rounded-full border-2 border-[#F4C542]/50 sm:inset-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        {team && traits ? (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [0.95, 1.08, 0.95], y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <GhostAvatar
              name={`${team}-forming`}
              team={team}
              teamCode={teamCode}
              traits={traits}
              mood="electric"
              size={128}
            />
          </motion.div>
        ) : (
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-4xl sm:text-5xl"
            animate={{ scale: [1, 1.12, 1], y: [0, -6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            👻
          </motion.div>
        )}
      </div>

      <motion.p
        className="mt-10 font-display text-2xl text-[#F4C542] sm:text-3xl"
        animate={{ opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Birthing your GoalGhost
      </motion.p>
      <p className="mt-2 text-sm text-muted">0G Compute · TEE-verified inference</p>

      <div className="mt-10 space-y-2.5 text-center">
        {RITUAL_LINES.map((line, i) => (
          <motion.p
            key={line}
            className="text-xs text-muted/80"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: [0.2, 1, 0.2], y: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.55 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}