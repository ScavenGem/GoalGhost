"use client";

import { useMemo } from "react";
import { motion } from "@/lib/motion";

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  kind: "spark" | "flag";
};

export function LegacyCinematicParticles({
  count = 28,
  active = true,
}: {
  count?: number;
  active?: boolean;
}) {
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        duration: 4 + Math.random() * 6,
        kind: i % 5 === 0 ? "flag" : "spark",
      })),
    [count]
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background:
              p.kind === "flag"
                ? "rgba(244, 197, 66, 0.35)"
                : "rgba(244, 197, 66, 0.65)",
            boxShadow:
              p.kind === "spark" ? "0 0 12px rgba(244, 197, 66, 0.45)" : undefined,
          }}
          animate={{
            y: [0, -30 - Math.random() * 40, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
            opacity: [0.2, 0.9, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}