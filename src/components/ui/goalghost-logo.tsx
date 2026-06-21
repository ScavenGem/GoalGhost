"use client";

import Image from "next/image";
import { motion } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

export function GoalGhostLogo({
  size = 32,
  className,
  spin = false,
  float = false,
  bounce = false,
}: {
  size?: number;
  className?: string;
  spin?: boolean;
  float?: boolean;
  bounce?: boolean;
}) {
  const img = (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-visible",
        className
      )}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <Image
        src="/goalghost-logo.png"
        alt="GoalGhost"
        width={256}
        height={256}
        sizes={`${size}px`}
        className="h-full w-full max-h-full max-w-full object-contain"
        priority
      />
    </span>
  );

  const animating = spin || float || bounce;
  if (!animating) return img;

  return (
    <motion.span
      className="inline-flex overflow-visible"
      style={{ width: size, height: size }}
      animate={{
        rotate: spin ? 360 : 0,
        y: bounce ? [0, -14, 0] : float ? [0, -6, 0] : 0,
        scale: bounce ? [1, 1.04, 1] : 1,
      }}
      transition={{
        rotate: spin ? { duration: 1.6, repeat: Infinity, ease: "linear" } : undefined,
        y:
          bounce || float
            ? { duration: bounce ? 1.8 : 2.2, repeat: Infinity, ease: "easeInOut" }
            : undefined,
        scale: bounce
          ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          : undefined,
      }}
    >
      {img}
    </motion.span>
  );
}

/** Subtle decorative accent, same motion as legacy ball accent */
export function GoalGhostAccent({
  size = 22,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("pointer-events-none inline-flex opacity-70", className)}
      animate={{ y: [0, -3, 0], rotate: [0, 8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <GoalGhostLogo size={size} />
    </motion.div>
  );
}