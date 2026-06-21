"use client";

import { motion } from "@/lib/motion";
import { useEffect, useState } from "react";

const COLORS = ["#F4C542", "#f8fafc", "#94a3b8", "#a78bfa", "#38bdf8"];

type Particle = { id: number; x: number; delay: number; color: string; size: number };

export function ConfettiCelebration({ active, duration = 4000 }: { active: boolean; duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!active) return;
    setParticles(
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.4,
        color: COLORS[i % COLORS.length],
        size: 4 + Math.random() * 6,
      }))
    );
    setShow(true);
    const t = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(t);
  }, [active, duration]);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-0 rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.4,
            backgroundColor: p.color,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "110vh", opacity: [1, 1, 0], rotate: 360 + Math.random() * 360 }}
          transition={{ duration: 2.5 + Math.random(), delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}