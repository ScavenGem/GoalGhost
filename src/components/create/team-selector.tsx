"use client";

import { motion } from "@/lib/motion";
import { WC_2026_NATIONS, type WcNation } from "@/lib/football/teams";
import { NationFlagEmoji } from "@/components/ui/nation-flag-emoji";
import { hoverCardSubtle } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";

export function TeamSelector({
  selected,
  onSelect,
}: {
  selected: WcNation | null;
  onSelect: (team: WcNation) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {WC_2026_NATIONS.map((nation, i) => {
        const active = selected?.code === nation.code;
        return (
          <motion.button
            key={nation.code}
            type="button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02, type: "spring", stiffness: 110 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(nation)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-4 text-left sm:p-5",
              active
                ? "border-[#F4C542]/60 bg-[#F4C542]/10 shadow-lg shadow-[#F4C542]/15"
                : cn("border-white/8 bg-[#0A1020]/50", hoverCardSubtle)
            )}
          >
            {active && (
              <motion.div
                layoutId="team-glow"
                className="absolute inset-0 bg-gradient-to-br from-[#F4C542]/20 via-transparent to-transparent"
                transition={{ type: "spring", stiffness: 200, damping: 28 }}
              />
            )}
            <motion.span
              className="relative block"
              animate={active ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              aria-hidden
            >
              <NationFlagEmoji
                name={nation.name}
                code={nation.code}
                size={40}
                className="h-9 w-9 sm:h-10 sm:w-10"
              />
            </motion.span>
            <p className="relative mt-3 font-semibold leading-tight tracking-tight">
              {nation.name}
            </p>
            <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-gradient-to-r from-transparent via-[#F4C542] to-transparent transition-transform duration-200 ease-in-out group-hover:scale-x-100" />
            {active && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#F4C542] shadow shadow-[#F4C542]/60"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}