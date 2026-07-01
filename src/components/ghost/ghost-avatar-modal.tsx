"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function GhostAvatarModal({
  open,
  onClose,
  name,
  team,
  stage,
  mood,
  children,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  team: string;
  stage?: string;
  mood?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-center justify-center p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} GoalGhost full view`}
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#0A1020]/88 backdrop-blur-md"
        aria-label="Close full view"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md">
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "absolute -right-1 -top-1 z-20 rounded-full border border-white/15",
            "bg-[#0A1020]/95 p-2.5 text-muted/80 shadow-lg transition-colors",
            "hover:border-[#F4C542]/35 hover:text-[#F4C542]"
          )}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="overflow-hidden rounded-[1.25rem] ring-1 ring-white/15 shadow-2xl shadow-black/60">
          {children}
        </div>
        <div className="mt-4 text-center">
          <p className="font-display text-2xl text-white">{name}</p>
          <p className="mt-1 text-sm text-muted/75">
            {team}
            {stage ? ` · ${stage}` : ""}
            {mood ? ` · ${mood}` : ""}
          </p>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "mt-5 rounded-lg border border-white/12 bg-[#0A1020]/80 px-8 py-2.5",
              "text-xs font-medium uppercase tracking-[0.2em] text-muted/80",
              "transition-colors hover:border-[#F4C542]/35 hover:text-[#F4C542]"
            )}
          >
            Exit
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}