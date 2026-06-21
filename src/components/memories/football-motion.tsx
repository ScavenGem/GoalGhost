"use client";

import { motion } from "@/lib/motion";

const FLOATERS = [
  { emoji: "⚽", left: "8%", delay: 0, duration: 14 },
  { emoji: "🏟️", left: "78%", delay: 2, duration: 18 },
  { emoji: "⚽", left: "42%", delay: 4, duration: 16 },
  { emoji: "🥅", left: "88%", delay: 1, duration: 20 },
  { emoji: "⚽", left: "22%", delay: 6, duration: 15 },
] as const;

export function FootballMotion() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Pitch lines */}
      <motion.div
        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-[#F4C542]/0 via-[#F4C542]/8 to-transparent"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-0 right-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[#F4C542]/6 to-transparent"
        animate={{ scaleX: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {FLOATERS.map((f, i) => (
        <motion.span
          key={i}
          className="absolute text-lg opacity-[0.07] md:text-xl"
          style={{ left: f.left, top: "10%" }}
          animate={{
            y: [0, 120, 240, 360],
            x: [0, i % 2 === 0 ? 20 : -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: f.duration,
            repeat: Infinity,
            delay: f.delay,
            ease: "linear",
          }}
        >
          {f.emoji}
        </motion.span>
      ))}
    </div>
  );
}