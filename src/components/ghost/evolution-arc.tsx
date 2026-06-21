"use client";

import { motion } from "@/lib/motion";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";

const STAGES = ["Newborn", "Growing", "Awakened", "Veteran", "Legend"];

export function EvolutionArc({ score, stage }: { score: number; stage: string }) {
  const pct = Math.min(100, score);
  const stageIndex = STAGES.indexOf(stage);
  const activeIndex = stageIndex >= 0 ? stageIndex : 0;

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#0A1020]/60 p-4">
        <div className="mb-3 flex items-center justify-between text-xs text-muted">
          <span className="flex items-center gap-2">
            <GoalGhostLogo size={14} />
            Form & evolution arc
          </span>
          <span className="font-medium text-[#F4C542]">{pct}%</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#F4C542]/60 to-[#F4C542]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div
            className="absolute top-1/2 -translate-y-1/2"
            initial={{ left: "0%" }}
            animate={{ left: `calc(${pct}% - 8px)` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <GoalGhostLogo size={16} />
          </motion.div>
        </div>
        <div className="mt-4 flex justify-between">
          {STAGES.map((s, i) => (
            <motion.div
              key={s}
              className="flex flex-col items-center gap-1"
              animate={i === activeIndex ? { scale: [1, 1.08, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div
                className={`h-2 w-2 rounded-full ${
                  i <= activeIndex ? "bg-[#F4C542]" : "bg-white/15"
                }`}
              />
              <span
                className={`hidden text-[9px] uppercase tracking-wider sm:block ${
                  i <= activeIndex ? "text-[#F4C542]/90" : "text-muted/40"
                }`}
              >
                {s}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}