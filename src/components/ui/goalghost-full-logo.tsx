"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export const GOALGHOST_LOGO_WIDTH = 140;
export const GOALGHOST_LOGO_HEIGHT = 152;

export function goalGhostLogoHeight(width: number): number {
  return Math.round(width * (GOALGHOST_LOGO_HEIGHT / GOALGHOST_LOGO_WIDTH));
}

/** Full logo (player on ball + GOALGHOST banner) from goalghost-logo-full.png. */
export function GoalGhostFullLogo({
  className,
  width = 72,
}: {
  className?: string;
  width?: number;
}) {
  const height = goalGhostLogoHeight(width);

  return (
    <Image
      src="/goalghost-logo-full.png"
      alt="GoalGhost"
      width={GOALGHOST_LOGO_WIDTH}
      height={GOALGHOST_LOGO_HEIGHT}
      sizes={`${width}px`}
      className={cn("object-contain", className)}
      style={{ width, height }}
    />
  );
}