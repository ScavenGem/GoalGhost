"use client";

import { motion } from "@/lib/motion";

const PITCH_LINE = 0.12;

export function LegacyCinematicBackdrop({ intense = false }: { intense?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute inset-[-10%]"
        animate={{ opacity: intense ? [0.55, 0.85, 0.55] : [0.35, 0.55, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 42%, rgba(244, 197, 66, 0.18) 0%, rgba(244, 197, 66, 0.04) 45%, transparent 72%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 400 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <rect
          x="40"
          y="60"
          width="320"
          height="680"
          rx="2"
          stroke="#F4C542"
          strokeOpacity={PITCH_LINE}
          strokeWidth="1"
        />
        <line
          x1="40"
          y1="400"
          x2="360"
          y2="400"
          stroke="white"
          strokeOpacity={PITCH_LINE * 0.85}
          strokeWidth="0.8"
        />
        <circle
          cx="200"
          cy="400"
          r="48"
          stroke="white"
          strokeOpacity={PITCH_LINE * 0.75}
          strokeWidth="0.8"
        />
        <rect x="120" y="60" width="160" height="72" stroke="white" strokeOpacity={PITCH_LINE * 0.6} strokeWidth="0.7" />
        <rect x="120" y="668" width="160" height="72" stroke="white" strokeOpacity={PITCH_LINE * 0.6} strokeWidth="0.7" />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 70% at 50% 50%, transparent 0%, #0A1020 78%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0A1020] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0A1020] to-transparent" />
    </div>
  );
}