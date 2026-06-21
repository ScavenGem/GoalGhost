"use client";

import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { cn } from "@/lib/utils/cn";

export function FootballLoader({
  label = "Loading…",
  prominent = false,
}: {
  label?: string;
  prominent?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-5 bg-[#0A1020] py-8",
        prominent && "min-h-[55vh] justify-center py-16"
      )}
    >
      <GoalGhostLogo
        size={prominent ? 84 : 52}
        spin
        float={!prominent}
        bounce={prominent}
      />
      <p className="text-xs uppercase tracking-[0.25em] text-muted">{label}</p>
    </div>
  );
}