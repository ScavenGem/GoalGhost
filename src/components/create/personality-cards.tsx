"use client";

import { motion } from "@/lib/motion";
import { PERSONALITY_ARCHETYPES } from "@/lib/create/personalities";
import type { GhostTraits } from "@/types/ghost";
import { cn } from "@/lib/utils/cn";

const TRAIT_LABELS: (keyof GhostTraits)[] = [
  "passion",
  "loyalty",
  "drama",
  "hope",
  "resilience",
];

export function PersonalityCards({
  selectedId,
  traits,
  onSelectArchetype,
  onTraitChange,
}: {
  selectedId: string | null;
  traits: GhostTraits;
  onSelectArchetype: (id: string, traits: GhostTraits) => void;
  onTraitChange: (traits: GhostTraits) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {PERSONALITY_ARCHETYPES.map((archetype, i) => {
          const active = selectedId === archetype.id;
          return (
            <motion.button
              key={archetype.id}
              type="button"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectArchetype(archetype.id, archetype.traits)}
              className={cn(
                "relative overflow-hidden rounded-2xl border p-5 text-left transition-shadow",
                active
                  ? "border-[#F4C542]/50 bg-[#F4C542]/8 shadow-lg shadow-[#F4C542]/10"
                  : "border-white/8 bg-[#0A1020]/40 hover:border-[#F4C542]/25 hover:shadow-md"
              )}
            >
              {active && (
                <motion.div
                  layoutId="personality-glow"
                  className="absolute inset-0 bg-gradient-to-br from-[#F4C542]/15 to-transparent"
                  transition={{ type: "spring", stiffness: 180, damping: 24 }}
                />
              )}
              <div className="relative flex items-start gap-3">
                <motion.span
                  className="text-2xl sm:text-3xl"
                  animate={active ? { rotate: [0, -8, 8, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {archetype.emoji}
                </motion.span>
                <div>
                  <p className="font-semibold text-foreground">{archetype.name}</p>
                  <p className="mt-1 text-sm leading-snug text-muted">{archetype.tagline}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-white/8 bg-[#0A1020]/60 p-5"
      >
        <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[#F4C542]">
          Fine-tune your soul
        </p>
        <div className="space-y-4">
          {TRAIT_LABELS.map((key) => (
            <div key={key}>
              <div className="mb-1.5 flex justify-between text-sm capitalize">
                <span className="text-muted">{key}</span>
                <span className="font-medium tabular-nums text-[#F4C542]">{traits[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={traits[key]}
                onChange={(e) =>
                  onTraitChange({ ...traits, [key]: Number(e.target.value) })
                }
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-[#F4C542]"
              />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}