"use client";

import { useId } from "react";
import { motion } from "@/lib/motion";
import { cn } from "@/lib/utils/cn";

/** Official 2026 FIFA World Cup Trionda-inspired ball (SVG, no external assets) */
export function TriondaBall({
  size = 48,
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
  const uid = useId().replace(/:/g, "");
  const shadeId = `trionda-shade-${uid}`;
  const clipId = `trionda-clip-${uid}`;

  const svg = (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("drop-shadow-md", className)}
      aria-hidden
    >
      <defs>
        <radialGradient id={shadeId} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#f6f6f6" />
          <stop offset="100%" stopColor="#c8c8c8" />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>

      <circle
        cx="50"
        cy="50"
        r="46"
        fill={`url(#${shadeId})`}
        stroke="#141414"
        strokeWidth="0.7"
      />

      <g clipPath={`url(#${clipId})`}>
        {/* Four thermally-bonded Trionda panels, host-nation colors */}
        <path
          d="M50 6 C66 14 80 30 88 50 C80 38 66 28 50 22 C34 28 20 38 12 50 C20 30 34 14 50 6Z"
          fill="#C8102E"
        />
        <path
          d="M88 50 C92 66 88 82 76 92 C72 74 68 58 62 44 C74 42 82 44 88 50Z"
          fill="#002868"
        />
        <path
          d="M76 92 C58 98 42 98 24 92 C38 86 52 78 62 66 C68 78 72 86 76 92Z"
          fill="#006847"
        />
        <path
          d="M12 50 C8 34 12 18 24 8 C28 26 32 42 38 56 C26 58 18 56 12 50Z"
          fill="#F4F4F4"
        />

        {/* Triple-wave trill bands across panels */}
        <path
          d="M50 22 C62 30 72 42 78 56 C68 52 58 48 50 44 C42 48 32 52 22 56 C28 42 38 30 50 22Z"
          fill="none"
          stroke="#F4C542"
          strokeWidth="1.4"
          opacity="0.85"
        />
        <path
          d="M50 44 C58 50 66 58 72 68 C62 66 54 62 50 56 C46 62 38 66 28 68 C34 58 42 50 50 44Z"
          fill="none"
          stroke="#1D4ED8"
          strokeWidth="1.1"
          opacity="0.7"
        />
        <path
          d="M50 56 C54 64 56 74 54 84 C48 78 44 68 42 58 C46 58 48 56 50 56Z"
          fill="none"
          stroke="#C8102E"
          strokeWidth="1"
          opacity="0.65"
        />

        {/* Canada: maple leaf */}
        <path
          d="M50 14 L51.8 19.2 L57 19.8 L53 23.4 L54.2 28.6 L50 26 L45.8 28.6 L47 23.4 L43 19.8 L48.2 19.2 Z
             M50 17.5 L49.2 20.8 L46 21.2 L48.4 23.2 L47.6 26.4 L50 24.8 L52.4 26.4 L51.6 23.2 L54 21.2 L50.8 20.8 Z"
          fill="#ffffff"
          opacity="0.95"
        />

        {/* USA: five-pointed star */}
        <path
          d="M82 48 L83.4 52.2 L87.8 52.2 L84.2 54.8 L85.6 59 L82 56.4 L78.4 59 L79.8 54.8 L76.2 52.2 L80.6 52.2 Z"
          fill="#ffffff"
          opacity="0.95"
        />

        {/* Mexico: golden eagle head silhouette */}
        <path
          d="M48 78 C52 74 58 74 62 78 C60 82 56 86 50 88 C44 86 40 82 48 78Z"
          fill="#F4C542"
        />
        <path
          d="M54 76 C58 74 64 76 66 80 C62 82 58 84 54 82 C56 80 56 78 54 76Z"
          fill="#006847"
          opacity="0.9"
        />
        <circle cx="58" cy="79" r="1.2" fill="#141414" />

        {/* Central star junction, distinctive Trionda iconography */}
        <path
          d="M50 38 L53 46 L61 46 L54.5 51 L57 59 L50 54 L43 59 L45.5 51 L39 46 L47 46 Z"
          fill="#ffffff"
          opacity="0.55"
        />
        <path
          d="M50 42 L52 47 L57 47 L53 50.5 L55 55.5 L50 52.5 L45 55.5 L47 50.5 L43 47 L48 47 Z"
          fill="#F4C542"
          opacity="0.75"
        />

        {/* Panel seam lines */}
        <path
          d="M50 6 C66 14 80 30 88 50 M88 50 C92 66 88 82 76 92 M76 92 C58 98 42 98 24 92 M12 50 C8 34 12 18 24 8 M24 8 C34 14 42 18 50 22"
          fill="none"
          stroke="#141414"
          strokeWidth="0.55"
          opacity="0.35"
        />
      </g>

      <circle cx="34" cy="30" r="9" fill="white" fillOpacity="0.2" />
    </svg>
  );

  const animating = spin || float || bounce;
  if (!animating) return svg;

  return (
    <motion.div
      className="inline-flex"
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
      {svg}
    </motion.div>
  );
}

/** Subtle decorative accent for buttons, reveals, and evolution UI */
export function TriondaAccent({
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
      <TriondaBall size={size} />
    </motion.div>
  );
}