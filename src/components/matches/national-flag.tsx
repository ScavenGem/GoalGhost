"use client";

import Image from "next/image";
import { isoCodeForTeam } from "@/lib/football/iso-codes";
import { cn } from "@/lib/utils/cn";

export function NationalFlag({
  team,
  code,
  size = 44,
  className,
  highlight,
}: {
  team: string;
  code?: string;
  size?: number;
  className?: string;
  highlight?: boolean;
}) {
  const iso = isoCodeForTeam(team, code);
  const height = Math.round(size * 0.72);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-md shadow-md ring-1 ring-white/15",
        highlight && "ring-[#F4C542]/50 shadow-[#F4C542]/20",
        className
      )}
      style={{ width: size, height }}
      aria-hidden
    >
      <Image
        src={`https://flagcdn.com/w${Math.min(160, size * 2)}/${iso}.png`}
        alt=""
        width={size}
        height={height}
        className="h-full w-full object-cover"
        unoptimized
      />
    </span>
  );
}