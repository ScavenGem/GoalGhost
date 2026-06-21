"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const FOOTER_BADGES = [
  {
    key: "compute",
    label: "Powered by 0G Compute (intelligence)",
    tint: "border-violet-500/20 bg-violet-500/[0.06]",
  },
  {
    key: "storage",
    label: "0G Storage (permanent memories)",
    tint: "border-[#F4C542]/20 bg-[#F4C542]/[0.06]",
  },
  {
    key: "chain",
    label: "0G Chain (verifiable ownership)",
    tint: "border-sky-500/20 bg-sky-500/[0.06]",
  },
] as const;

export function OgLayerBadges({
  className,
  variant = "footer",
}: {
  className?: string;
  variant?: "footer" | "inline";
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center",
        variant === "footer" && "border-t border-white/[0.06] px-4 py-6 sm:px-6 sm:py-8",
        className
      )}
    >
      <div className="flex w-full max-w-5xl flex-row flex-nowrap items-center justify-center gap-2 sm:gap-4">
        {FOOTER_BADGES.map((badge) => (
          <div
            key={badge.key}
            className={cn(
              "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border px-2.5 py-2 backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2.5",
              badge.tint
            )}
          >
            <Image
              src="/og-logo.svg"
              alt="0G"
              width={32}
              height={16}
              className="h-3 w-auto shrink-0 opacity-90 sm:h-3.5"
            />
            <span className="text-center text-[9px] font-medium leading-tight text-white/85 sm:text-[11px] sm:leading-snug">
              {badge.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}