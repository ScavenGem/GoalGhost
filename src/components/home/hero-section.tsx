"use client";

import Link from "next/link";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 1, ease: [0.22, 1, 0.36, 1] as const },
});

const PITCH_LINE = 0.14;

function HeroPitchBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="pitch-parallax-slow absolute inset-[-8%]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 95% 72% at 50% 38%, rgba(11, 52, 34, 0.42) 0%, rgba(8, 36, 24, 0.18) 52%, rgba(10, 16, 32, 0) 72%)",
          }}
        />

        <svg
          className="absolute inset-0 h-full w-full opacity-90"
          viewBox="0 0 400 700"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <rect
            x="48"
            y="44"
            width="304"
            height="612"
            rx="2"
            stroke="white"
            strokeOpacity={PITCH_LINE}
            strokeWidth="1"
          />
          <line
            x1="48"
            y1="350"
            x2="352"
            y2="350"
            stroke="white"
            strokeOpacity={PITCH_LINE * 0.9}
            strokeWidth="0.9"
          />
          <circle
            cx="200"
            cy="350"
            r="50"
            stroke="white"
            strokeOpacity={PITCH_LINE * 0.85}
            strokeWidth="0.9"
          />
          <circle
            cx="200"
            cy="350"
            r="2.5"
            fill="white"
            fillOpacity={PITCH_LINE * 0.65}
          />
          <rect
            x="112"
            y="44"
            width="176"
            height="68"
            stroke="white"
            strokeOpacity={PITCH_LINE * 0.75}
            strokeWidth="0.8"
          />
          <rect
            x="112"
            y="588"
            width="176"
            height="68"
            stroke="white"
            strokeOpacity={PITCH_LINE * 0.75}
            strokeWidth="0.8"
          />
          <rect
            x="152"
            y="44"
            width="96"
            height="26"
            stroke="white"
            strokeOpacity={PITCH_LINE * 0.55}
            strokeWidth="0.7"
          />
          <rect
            x="152"
            y="630"
            width="96"
            height="26"
            stroke="white"
            strokeOpacity={PITCH_LINE * 0.55}
            strokeWidth="0.7"
          />
        </svg>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 65% at 50% 42%, transparent 0%, #0A1020 78%)",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0A1020] via-[#0A1020]/90 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A1020] via-[#0A1020]/92 to-transparent" />
    </div>
  );
}

function scrollToHowItWorks() {
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
}

export function HeroSection() {
  return (
    <section className="relative -mx-4 overflow-hidden sm:-mx-6 md:-mx-8">
      <HeroPitchBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 pt-8 pb-20 text-center sm:px-12 sm:pt-10 sm:pb-24 md:px-16 md:pt-9 md:pb-28">
        <motion.div {...fadeUp(0.1)} className="w-full max-w-4xl">
          <h1 className="font-display text-[1.95rem] font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl lg:text-[3.75rem]">
            <span className="block leading-[1.08] text-[#F4C542] sm:leading-[1.06] lg:leading-[1.04]">
              Every World Cup Creates Identity.
            </span>
            <span className="mt-1.5 block leading-[1.06] text-white sm:mt-2 sm:leading-[1.04] lg:mt-2.5 lg:leading-[1.02]">
              GoalGhost Makes It Yours.
            </span>
          </h1>
        </motion.div>

        <motion.p
          {...fadeUp(0.25)}
          className="mt-8 max-w-xl text-base font-light leading-relaxed tracking-wide text-white/65 sm:mt-10 sm:text-lg md:max-w-2xl md:text-xl"
        >
          Evolved through every match, verified by 0G.
        </motion.p>

        <motion.div
          {...fadeUp(0.38)}
          className="mt-12 flex w-full max-w-md flex-col items-center gap-4 sm:mt-14 sm:max-w-lg"
        >
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch">
            <Link href="/create" className="w-full sm:flex-1">
              <Button
                size="lg"
                className="h-14 w-full px-8 text-base font-semibold tracking-wide shadow-lg shadow-[#F4C542]/20 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(244,197,66,0.35)]"
              >
                Birth Your GoalGhost →
              </Button>
            </Link>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={scrollToHowItWorks}
              className="h-14 w-full border-white/15 bg-transparent px-6 text-sm font-medium tracking-wide text-white/75 hover:border-[#F4C542]/35 hover:bg-[#F4C542]/[0.04] hover:text-[#F4C542] sm:flex-1"
            >
              How GoalGhost Works
            </Button>
          </div>
          <Link href="/matches" className="w-full">
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full border-white/15 bg-transparent px-8 text-sm font-medium tracking-wide text-white/70 hover:border-white/25 hover:bg-white/[0.03] hover:text-white/90"
            >
              Explore Match Center
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}