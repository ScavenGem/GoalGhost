"use client";

import { motion } from "@/lib/motion";
import { Brain, Database, Link2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type OgLayer = "compute" | "storage" | "chain";

const LAYER_CONFIG: Record<
  OgLayer,
  { label: string; icon: typeof Brain; accent: string }
> = {
  compute: {
    label: "Powered by 0G Compute (intelligence)",
    icon: Brain,
    accent: "border-violet-500/30 bg-violet-500/10 text-violet-100",
  },
  storage: {
    label: "0G Storage (permanent memories)",
    icon: Database,
    accent: "border-[#F4C542]/30 bg-[#F4C542]/10 text-[#F4C542]",
  },
  chain: {
    label: "0G Chain (verifiable ownership)",
    icon: Link2,
    accent: "border-sky-500/30 bg-sky-500/10 text-sky-100",
  },
};

export function OgPoweredBadge({
  layer,
  size = "sm",
  className,
}: {
  layer: OgLayer;
  size?: "sm" | "md";
  className?: string;
}) {
  const cfg = LAYER_CONFIG[layer];
  const Icon = cfg.icon;

  return (
    <motion.span
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        cfg.accent,
        size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3.5 py-1.5 text-xs",
        className
      )}
    >
      <Icon className={size === "sm" ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0"} />
      <span>{cfg.label}</span>
    </motion.span>
  );
}

export function OgPoweredStrip({ layers }: { layers: OgLayer[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {layers.map((layer) => (
        <OgPoweredBadge key={layer} layer={layer} />
      ))}
    </div>
  );
}