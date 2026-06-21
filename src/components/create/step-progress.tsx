"use client";

import { motion } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  "Wallet",
  "Nation",
  "Soul",
  "Birth",
  "Mint",
  "Memory",
] as const;

export function StepProgress({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gold"
              initial={{ width: 0 }}
              animate={{ width: i <= current ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
          <span
            className={cn(
              "text-[10px] uppercase tracking-wider",
              i <= current ? "text-gold" : "text-muted"
            )}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}