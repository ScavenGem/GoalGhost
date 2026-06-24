"use client";

import { teamFlagEmoji, twemojiFlagSrc } from "@/lib/football/flags";
import { cn } from "@/lib/utils/cn";

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