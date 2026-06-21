"use client";

import { motion } from "@/lib/motion";

export function WrappedProgress({
  current,
  total,
  autoPlay,
}: {
  current: number;
  total: number;
  autoPlay: boolean;
}) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted">
        <span>GoalGhost Wrapped</span>
        <span>
          {current + 1} / {total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full bg-[#F4C542]"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: autoPlay ? 5.5 : 0.4, ease: "linear" }}
        />
      </div>
    </div>
  );
}