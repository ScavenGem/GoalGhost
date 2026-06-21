"use client";

import Link from "next/link";
import { motion } from "@/lib/motion";
import { ArrowRight, Sparkles, Radio, TrendingUp, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STEPS = [
  {
    step: 1,
    title: "Birth Your GoalGhost",
    description:
      "Connect your wallet and birth a football soul tied to your nation: intelligence from 0G Compute, identity on 0G Chain.",
    icon: Sparkles,
    accent: "from-[#F4C542]/20 to-[#F4C542]/5",
  },
  {
    step: 2,
    title: "Experience Matches & Build Memories",
    description:
      "Feel every kickoff, comeback, and final whistle. Each reaction seals permanently to 0G Storage.",
    icon: Radio,
    accent: "from-red-500/15 to-red-500/5",
  },
  {
    step: 3,
    title: "Watch Your Ghost Evolve",
    description:
      "Your ghost grows in confidence and mood with every match witnessed, shaped by real tournament emotion.",
    icon: TrendingUp,
    accent: "from-emerald-500/15 to-emerald-500/5",
  },
  {
    step: 4,
    title: "Claim Your Emotional Legacy",
    description:
      "Unwrap your World Cup story: a permanent, wallet-owned legacy narrated by 0G Compute and sealed forever.",
    icon: Trophy,
    accent: "from-[#F4C542]/18 to-transparent",
  },
] as const;

function StepCard({
  step,
  title,
  description,
  icon: Icon,
  accent,
  index,
}: (typeof STEPS)[number] & { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-2xl border border-white/8 bg-[#0A1020]/70 p-5",
          "transition-colors duration-300 hover:border-[#F4C542]/20 hover:bg-[#0A1020]/85"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-60 blur-2xl",
            accent
          )}
        />

        <div className="relative flex items-start gap-4">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F4C542]/25 bg-[#F4C542]/10 transition-colors group-hover:border-[#F4C542]/40 group-hover:bg-[#F4C542]/15">
              <Icon className="h-5 w-5 text-[#F4C542]" />
            </div>
            <span className="font-mono text-[10px] text-muted/50">0{step}</span>
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="font-display text-base leading-snug text-white/92 md:text-lg">
              {title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted/80">{description}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function HowItWorks() {
  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
          The journey
        </p>
        <h2 className="mt-2 font-display text-2xl text-white/90 md:text-3xl">
          How it Works
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted/80">
          Four steps from first kickoff to a legacy that lives on 0G, forever yours.
        </p>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((item, index) => (
          <StepCard key={item.step} {...item} index={index} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="flex justify-center pt-1"
      >
        <Link
          href="/how-it-works"
          className="inline-flex items-center gap-1.5 text-sm text-[#F4C542]/80 transition-colors hover:text-[#F4C542]"
        >
          Learn More
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </motion.div>
    </section>
  );
}