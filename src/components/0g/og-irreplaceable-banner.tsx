"use client";

import { motion } from "@/lib/motion";
import { Shield } from "lucide-react";

export function OgIrreplaceableBanner({ compact = false }: { compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border border-[#F4C542]/20 bg-gradient-to-r from-[#F4C542]/8 to-transparent ${
        compact ? "px-4 py-3" : "px-5 py-4"
      }`}
    >
      <div className="flex items-start gap-3">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#F4C542]" />
        <div>
          <p className={`font-medium text-[#F4C542] ${compact ? "text-xs" : "text-sm"}`}>
            0G does irreplaceable work here
          </p>
          <p className={`mt-1 leading-relaxed text-muted ${compact ? "text-[11px]" : "text-xs"}`}>
            Remove 0G Compute → no intelligence. Remove 0G Storage → no permanent memories.
            Remove 0G Chain → no verifiable ownership.
          </p>
        </div>
      </div>
    </motion.div>
  );
}