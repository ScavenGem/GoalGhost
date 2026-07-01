"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function LegacyCinematicVolumeControl({
  volume,
  muted,
  onVolumeChange,
  onMutedChange,
  onInteract,
}: {
  volume: number;
  muted: boolean;
  onVolumeChange: (volume: number) => void;
  onMutedChange: (muted: boolean) => void;
  onInteract: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const iconMuted = muted || volume === 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          onInteract();
          setOpen((v) => !v);
        }}
        className={cn(
          "rounded-lg p-2.5 text-muted/60 transition-colors duration-200 hover:bg-white/5 hover:text-[#F4C542]",
          open && "bg-white/5 text-[#F4C542]"
        )}
        aria-label="Volume controls"
        aria-expanded={open}
        aria-haspopup="true"
        title="Adjust stadium ambience volume"
      >
        {iconMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-white/10 bg-[#0A1020]/95 px-3 py-3 shadow-xl shadow-black/50 backdrop-blur-md"
          role="group"
          aria-label="Volume"
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onInteract();
                onMutedChange(!muted);
              }}
              className="shrink-0 rounded-md p-1 text-muted/70 transition-colors hover:bg-white/5 hover:text-[#F4C542]"
              aria-label={muted ? "Unmute ambience" : "Mute ambience"}
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(volume * 100)}
              onChange={(e) => {
                onInteract();
                const next = Number(e.target.value) / 100;
                onVolumeChange(next);
                if (muted && next > 0) onMutedChange(false);
              }}
              aria-label="Volume level"
              className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/15 accent-[#F4C542] [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F4C542]"
            />
          </div>
          <p className="mt-2 text-center text-[9px] uppercase tracking-wider text-muted/50">
            {muted ? "Muted" : `${Math.round(volume * 100)}%`}
          </p>
        </div>
      )}
    </div>
  );
}