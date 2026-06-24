"use client";

import { useInView } from "framer-motion";
import { motion } from "@/lib/motion";
import { memo, useRef } from "react";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { hoverLink } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";
import { storageScanUrl } from "@/lib/0g/network";


export type MemoryCardData = {
  eventId: string;
  type: string;
  title?: string;
  content?: string;
  emotionalTone?: string;
  rootHash: string;
  occurredAt: string;
};

const TYPE_STYLES: Record<
  string,
  { label: string; accent: string; glow: string; emoji: string; bg: string }
> = {
  milestone: {
    label: "Birth",
    accent: "text-[#F4C542]",
    glow: "from-[#F4C542]/70",
    emoji: "✦",
    bg: "from-[#F4C542]/8",
  },
  match_reaction: {
    label: "Match felt",
    accent: "text-sky-300",
    glow: "from-sky-400/60",
    emoji: "⚽",
    bg: "from-sky-500/8",
  },
  evolution_checkpoint: {
    label: "Evolution",
    accent: "text-violet-300",
    glow: "from-violet-400/60",
    emoji: "↗",
    bg: "from-violet-500/8",
  },
  legacy: {
    label: "Legacy",
    accent: "text-rose-300",
    glow: "from-rose-400/60",
    emoji: "∞",
    bg: "from-rose-500/8",
  },
};

export const MemoryCard = memo(function MemoryCard({
  memory,
  index,
  sequence,
}: {
  memory: MemoryCardData;
  index: number;
  sequence?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const style = TYPE_STYLES[memory.type] ?? {
    label: memory.type,
    accent: "text-muted",
    glow: "from-white/20",
    emoji: "·",
    bg: "from-white/5",
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40, scale: 0.96 }}
      animate={inView ? { opacity: 1, x: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 80 }}
      className="relative pb-12 pl-12 sm:pb-14 sm:pl-16"
    >
      <motion.div
        className="absolute left-2 top-7 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#F4C542] bg-[#0A1020] text-xs shadow-lg shadow-[#F4C542]/25 sm:left-3 sm:h-8 sm:w-8"
        animate={{
          y: memory.type === "match_reaction" ? [0, -4, 0] : 0,
          boxShadow:
            memory.type === "match_reaction"
              ? [
                  "0 0 12px rgba(244,197,66,0.2)",
                  "0 0 20px rgba(244,197,66,0.4)",
                  "0 0 12px rgba(244,197,66,0.2)",
                ]
              : undefined,
        }}
        transition={{
          y: { duration: 2.5, repeat: Infinity, delay: index * 0.2 },
          boxShadow: { duration: 2, repeat: Infinity },
        }}
      >
        {style.emoji}
      </motion.div>

      <Card
        interactive
        className={cn(
          "group relative overflow-hidden border-white/8 bg-gradient-to-br",
          style.bg,
          "to-[#0A1020]/80"
        )}
      >
        <div className={`h-1 bg-gradient-to-r ${style.glow} to-transparent`} />
        <span className="pointer-events-none absolute right-4 top-4 text-2xl opacity-[0.06] transition-[opacity,transform] duration-200 ease-in-out group-hover:scale-110 group-hover:opacity-[0.12]">
          {memory.type === "match_reaction" ? "⚽" : "🏟️"}
        </span>
        <CardContent className="p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {sequence != null && (
                  <span className="rounded border border-[#F4C542]/20 px-1.5 py-0.5 font-mono text-[10px] text-[#F4C542]/60">
                    #{sequence}
                  </span>
                )}
                <p className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${style.accent}`}>
                  {style.label}
                </p>
              </div>
              <h3 className="mt-2 font-display text-xl leading-snug sm:text-2xl">
                {memory.title ?? "Untitled evolution"}
              </h3>
              {memory.content && (
                <p className="mt-3 text-base leading-relaxed text-foreground/75">{memory.content}</p>
              )}
              {memory.emotionalTone && (
                <motion.span
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.2 }}
                  className="mt-4 inline-block rounded-full border border-[#F4C542]/25 bg-[#F4C542]/8 px-3 py-1 text-xs capitalize text-[#F4C542]"
                >
                  {memory.emotionalTone}
                </motion.span>
              )}
            </div>
            <time className="shrink-0 text-xs leading-relaxed text-muted sm:text-right">
              {new Date(memory.occurredAt).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              <br />
              {new Date(memory.occurredAt).toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/5 pt-4">
            <a
              href={storageScanUrl(memory.rootHash)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 font-mono text-[11px] text-muted/50",
                hoverLink
              )}
            >
              Verify on Storage · {memory.rootHash.slice(0, 14)}…
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});