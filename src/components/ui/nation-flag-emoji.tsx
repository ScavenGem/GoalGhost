"use client";

import { teamFlagEmoji } from "@/components/matches/match-card";
import { cn } from "@/lib/utils/cn";

function twemojiFlagSrc(emoji: string): string {
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0))
    .filter((cp): cp is number => cp !== undefined)
    .map((cp) => cp.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoints}.png`;
}

/** Colorful national flag, same Twemoji style as Create / Nation selection */
export function NationFlagEmoji({
  name,
  code,
  size = 40,
  className,
}: {
  name: string;
  code?: string;
  size?: number;
  className?: string;
}) {
  const emoji = teamFlagEmoji(name, code);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={twemojiFlagSrc(emoji)}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}