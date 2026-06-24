"use client";

import { teamFlagEmoji, twemojiFlagSrc } from "@/lib/football/flags";
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
  const emoji = teamFlagEmoji(team, code);
  const imgSize = Math.round(size * 0.85);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center leading-none",
        highlight && "drop-shadow-[0_0_10px_rgba(244,197,66,0.4)]",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* Same Twemoji rendering as Match Center */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={twemojiFlagSrc(emoji)}
        alt=""
        width={imgSize}
        height={imgSize}
        className="shrink-0"
        style={{ width: imgSize, height: imgSize }}
        draggable={false}
      />
    </span>
  );
}