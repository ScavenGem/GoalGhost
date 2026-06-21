"use client";

import { motion } from "@/lib/motion";
import { Radio, Trophy, Calendar } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const VARIANTS = {
  live: {
    icon: Radio,
    label: "Live Matches",
    pulse: true,
    accent: "text-red-200 border-red-500/25 bg-red-500/10",
  },
  finished: {
    icon: Trophy,
    label: "Recent Results",
    pulse: false,
    accent: "text-muted border-white/10 bg-white/5",
  },
  upcoming: {
    icon: Calendar,
    label: "Upcoming Fixtures",
    pulse: false,
    accent: "text-[#F4C542]/90 border-[#F4C542]/20 bg-[#F4C542]/8",
  },
} as const;

export function MatchSectionHeader({
  variant,
  count,
  className,
}: {
  variant: keyof typeof VARIANTS;
  count: number;
  className?: string;
}) {
  const cfg = VARIANTS[variant];
  const Icon = cfg.icon;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        <h2 className="font-display text-xl text-white/90 md:text-2xl">
          {cfg.label}
        </h2>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium",
            cfg.accent
          )}
        >
          {cfg.pulse && variant === "live" && (
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className="h-2.5 w-2.5 animate-pulse" />
            </motion.span>
          )}
          {!cfg.pulse && <Icon className="h-2.5 w-2.5 opacity-70" />}
          {count}
        </span>
      </div>
    </div>
  );
}