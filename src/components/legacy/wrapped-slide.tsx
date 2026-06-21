"use client";

import { motion } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

export type WrappedSlideData = {
  eyebrow: string;
  headline: string;
  body: string;
  stat?: string;
  statLabel?: string;
  gradient: string;
  size?: "hero" | "default";
};

export function WrappedSlide({ slide, active }: { slide: WrappedSlideData; active: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      key={slide.headline}
      initial={{ opacity: 0, scale: 0.94, y: 32 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.04, y: -24 }}
      transition={{ type: "spring", stiffness: 55, damping: 14, duration: 0.6 }}
      className={cn(
        "relative flex min-h-[440px] flex-col justify-between overflow-hidden rounded-3xl border border-[#F4C542]/15 bg-gradient-to-br from-[#0A1020] p-10 md:min-h-[500px] md:p-14",
        slide.gradient
      )}
    >
      {/* Ambient orbs */}
      <motion.div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#F4C542]/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl"
        animate={{ scale: [1.1, 0.9, 1.1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative">
        <motion.p
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#F4C542]/90"
        >
          {slide.eyebrow}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 80 }}
          className={cn(
            "mt-5 font-display leading-[1.08] text-foreground",
            slide.size === "hero" ? "text-5xl md:text-6xl lg:text-7xl" : "text-4xl md:text-5xl"
          )}
        >
          {slide.headline}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-6 max-w-xl whitespace-pre-line text-lg leading-relaxed text-foreground/85 md:text-xl"
        >
          {slide.body}
        </motion.p>
      </div>

      {slide.stat && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 70 }}
          className="relative mt-10"
        >
          <motion.p
            className="font-display text-5xl text-[#F4C542] md:text-6xl lg:text-7xl"
            animate={slide.size === "hero" ? { scale: [1, 1.02, 1] } : undefined}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {slide.stat}
          </motion.p>
          {slide.statLabel && (
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-muted">
              {slide.statLabel}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}