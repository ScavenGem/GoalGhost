"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const LOGO_WIDTH = 140;
const LOGO_HEIGHT = 152;

/** Full logo (player on ball + GOALGHOST banner) from goalghost-logo-full.png. */
export function GoalGhostFullLogo({
  className,
  width = 72,
}: {
  className?: string;
  width?: number;
}) {
  const height = Math.round(width * (LOGO_HEIGHT / LOGO_WIDTH));

  return (
    <Image
      src="/goalghost-logo-full.png"
      alt="GoalGhost"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      sizes={`${width}px`}
      className={cn("object-contain", className)}
      style={{ width, height }}
    />
  );
}