"use client";

import Link from "next/link";
import { motion } from "@/lib/motion";
import {
  ArrowLeft,
  Brain,
  Link2,
  Database,
  MessageSquare,
  Radio,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { OgIrreplaceableBanner } from "@/components/0g/og-irreplaceable-banner";
import { cn } from "@/lib/utils/cn";

const JOURNEY_STEPS = [
  {
    step: 1,
    title: "Birth Your GoalGhost",
    summary: "Connect your wallet and birth a fan identity tied to your nation.",
    details: [
      "Choose your nation and complete the birth ritual on /create.",
      "0G Compute crafts your ghost's personality, conviction, and emotional baseline.",
      "Your profile is encrypted to your wallet and sealed on 0G Storage.",
      "Ownership is registered on 0G Chain: your keys, your identity.",
    ],
    icon: Sparkles,
    href: "/create",
    cta: "Birth Your GoalGhost",
  },
  {
    step: 2,
    title: "Experience Matches & Build Your Fan Identity",
    summary: "Feel every kickoff, comeback, and final whistle across the tournament.",
    details: [
      "Follow live, finished, and upcoming World Cup matches on Home and Match Center.",
      "Tap Feel This Match to let 0G Compute react in real time to the drama on the pitch.",
      "Each reaction becomes part of your fan identity evolution, encrypted and verified on 0G Storage.",
      "Evolution chapters appear in your fan journey, building the emotional arc of your tournament.",
    ],
    icon: Radio,
    href: "/matches",
    cta: "Open Match Center",
  },
  {
    step: 3,
    title: "Watch Your Ghost Evolve",
    summary: "Your ghost grows in confidence, mood, and evolution with every match witnessed.",
    details: [
      "Evolution score and confidence shift after each match reaction you feel.",
      "Visit your Ghost page to see mood, evolution stage, and narrative growth.",
      "Trigger an evolution briefing: 0G Compute narrates how the tournament is shaping your fan identity.",
      "Every milestone is anchored by storage roots and wallet-owned identity on chain.",
    ],
    icon: TrendingUp,
    href: "/ghost",
    cta: "View Your Ghost",
  },
  {
    step: 4,
    title: "Claim Your Emotional Legacy",
    summary: "Unwrap your World Cup story: a fan identity legacy only you can own.",
    details: [
      "Generate your Legacy wrapped on /legacy, a cinematic recap of your tournament journey.",
      "0G Compute narrates rivalries, comebacks, and final whistles from your fan journey.",
      "The full legacy document is etched to 0G Storage and indexed in your evolution arc.",
      "Share it, revisit it, and leave wallet-signed comments on the decentralized wall.",
    ],
    icon: Trophy,
    href: "/legacy",
    cta: "Claim Your Legacy",
  },
] as const;

const OG_LAYERS = [
  {
    title: "0G Compute",
    subtitle: "Intelligence",
    description:
      "Powers ghost birth, live match reactions, evolution narratives, and your Legacy wrapped. Every emotional response is TEE-verified inference, not a scripted template.",
    icon: Brain,
    tint: "border-violet-500/25 bg-violet-500/[0.07]",
    iconTint: "text-violet-300",
  },
  {
    title: "0G Storage",
    subtitle: "Identity evolution data",
    description:
      "Profiles, match reactions, legacy documents, and signed comments live here. Data is content-addressed by Merkle root: emotionally permanent, retrievable, and independent of any central database.",
    icon: Database,
    tint: "border-[#F4C542]/25 bg-[#F4C542]/[0.07]",
    iconTint: "text-[#F4C542]",
  },
  {
    title: "0G Chain",
    subtitle: "Verifiable ownership",
    description:
      "Your GoalGhost identity and storage roots anchor on 0G Chain. Wallet keys prove ownership. Remove the chain and the verifiable link between you and your legacy disappears.",
    icon: Link2,
    tint: "border-sky-500/25 bg-sky-500/[0.07]",
    iconTint: "text-sky-300",
  },
] as const;

const COMMUNITY_FEATURES = [
  {
    title: "Comment on World Cup News",
    description:
      "Connect your wallet and leave signed comments under any headline in the World Cup News section. Each comment is verified with personal_sign, stored on 0G Storage, and visible to everyone.",
    icon: MessageSquare,
    href: "/",
  },
  {
    title: "Evolve Your Ghost",
    description:
      "As your legacy grows, request an evolution briefing on your Ghost page. 0G Compute reflects on your journey and updates your fan identity's narrative voice.",
    icon: TrendingUp,
    href: "/ghost",
  },
  {
    title: "Claim & Share Legacy",
    description:
      "When the tournament arc is ready, unwrap your Legacy: a shareable, wallet-owned story sealed forever. Add signed notes on the Legacy comments wall for the community.",
    icon: Trophy,
    href: "/legacy",
  },
] as const;

function JourneyStepCard({
  step,
  title,
  summary,
  details,
  icon: Icon,
  href,
  cta,
  index,
}: (typeof JOURNEY_STEPS)[number] & { index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-32px" }}
      transition={{ delay: index * 0.06, duration: 0.55 }}
      className="rounded-2xl border border-white/8 bg-[#0A1020]/75 p-6 md:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#F4C542]/25 bg-[#F4C542]/10">
          <Icon className="h-5 w-5 text-[#F4C542]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted/55">
            Step 0{step}
          </p>
          <h2 className="mt-1 font-display text-xl text-white/92 md:text-2xl">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted/85">{summary}</p>
        </div>
      </div>
      <ul className="mt-5 space-y-2.5 border-t border-white/6 pt-5">
        {details.map((line) => (
          <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-muted/80">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#F4C542]/70" />
            {line}
          </li>
        ))}
      </ul>
      <Link href={href} className="mt-5 inline-block">
        <Button variant="outline" size="sm" className="border-[#F4C542]/25 text-[#F4C542]/90">
          {cta} →
        </Button>
      </Link>
    </motion.article>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="relative mx-auto max-w-3xl space-y-14 pb-16">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted/80 transition-colors hover:text-[#F4C542]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <PageHeader
        eyebrow="The full journey"
        title="How GoalGhost Works"
        description="From your first kickoff to a living fan identity legacy: evolved through every match, verified by 0G Compute, Storage, and Chain."
      />

      <OgIrreplaceableBanner />

      <section className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
            Four steps
          </p>
          <h2 className="mt-2 font-display text-2xl text-white/90">Your tournament arc</h2>
        </div>
        <div className="space-y-5">
          {JOURNEY_STEPS.map((item, index) => (
            <JourneyStepCard key={item.step} {...item} index={index} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
            0G stack
          </p>
          <h2 className="mt-2 font-display text-2xl text-white/90">Built on 0G</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted/80">
            GoalGhost is not a centralized app with a crypto skin. Each layer of 0G does
            irreplaceable work. Remove one and the experience breaks.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {OG_LAYERS.map((layer, index) => {
            const Icon = layer.icon;
            return (
              <motion.div
                key={layer.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className={cn(
                  "rounded-2xl border p-5",
                  layer.tint
                )}
              >
                <Icon className={cn("h-5 w-5", layer.iconTint)} />
                <p className="mt-3 font-display text-lg text-white/90">{layer.title}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted/60">
                  {layer.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted/80">
                  {layer.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
            Go deeper
          </p>
          <h2 className="mt-2 font-display text-2xl text-white/90">Community & growth</h2>
        </div>
        <div className="space-y-4">
          {COMMUNITY_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06, duration: 0.45 }}
                className="flex gap-4 rounded-2xl border border-white/8 bg-[#0A1020]/60 p-5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                  <Icon className="h-4 w-4 text-[#F4C542]" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-white/90">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted/80">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href}
                    className="mt-2 inline-block text-xs text-[#F4C542]/80 hover:text-[#F4C542]"
                  >
                    Explore →
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-col items-center gap-4 border-t border-white/6 pt-10 sm:flex-row sm:justify-center">
        <Link href="/">
          <Button variant="outline" className="border-white/15">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <Link href="/create">
          <Button className="shadow-lg shadow-[#F4C542]/10">Birth Your GoalGhost →</Button>
        </Link>
      </div>
    </div>
  );
}