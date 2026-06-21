import type { LegacyDocument, LegacyMoment } from "@/types/legacy";
import type { WrappedSlideData } from "@/components/legacy/wrapped-slide";

export type GhostMemory = {
  title?: string;
  content?: string;
  emotionalTone?: string;
  type?: string;
  occurredAt?: string;
};

export type GhostLegacyInput = {
  name: string;
  team: string;
  evolutionScore: number;
  confidence: number;
  mood: string;
  tokenId: number;
  memories?: GhostMemory[];
};

export type LegacyApiOutput = {
  story: string;
  highlights: string[];
  transformation: { from: string; to: string; arc: string };
  shareText: string;
  dominantMood: string;
  celebration: { title: string; body: string };
  heartbreak: { title: string; body: string };
  rivalry: { title: string; body: string };
  fanIdentity: { title: string; body: string };
};

const GRADIENTS = [
  "from-[#F4C542]/20 via-[#0A1020] to-[#0A1020]",
  "from-emerald-500/15 via-[#0A1020] to-[#0A1020]",
  "from-rose-500/14 via-[#0A1020] to-[#0A1020]",
  "from-orange-500/14 via-[#0A1020] to-[#0A1020]",
  "from-violet-500/14 via-[#0A1020] to-[#0A1020]",
  "from-sky-500/12 via-[#0A1020] to-[#0A1020]",
  "from-[#F4C542]/25 via-[#0A1020] to-[#0A1020]",
];

function requireMoment(
  value: { title?: string; body?: string } | undefined,
  field: string
): LegacyMoment {
  const title = value?.title?.trim();
  const body = value?.body?.trim();
  if (!title || !body) {
    throw new Error(`Legacy generation missing ${field}`);
  }
  return { title, body };
}

/** Assembles a legacy document from 0G Compute output and indexed ghost stats. */
export function buildLegacyDocument(
  ghost: GhostLegacyInput,
  api: LegacyApiOutput
): LegacyDocument {
  const story = api.story?.trim();
  if (!story) throw new Error("Legacy generation missing story");

  const highlights = api.highlights?.filter((h) => h.trim().length > 0) ?? [];
  if (highlights.length === 0) {
    throw new Error("Legacy generation missing highlights");
  }

  const transformation = api.transformation;
  if (
    !transformation?.from?.trim() ||
    !transformation?.to?.trim() ||
    !transformation?.arc?.trim()
  ) {
    throw new Error("Legacy generation missing transformation");
  }

  const shareText = api.shareText?.trim();
  if (!shareText) throw new Error("Legacy generation missing shareText");

  const dominantMood = api.dominantMood?.trim() || ghost.mood;
  const celebration = requireMoment(api.celebration, "celebration");
  const heartbreak = requireMoment(api.heartbreak, "heartbreak");
  const rivalry = requireMoment(api.rivalry, "rivalry");
  const fanIdentity = requireMoment(api.fanIdentity, "fanIdentity");

  const memories = ghost.memories ?? [];

  return {
    version: 1,
    tokenId: ghost.tokenId,
    season: "FIFA World Cup 2026",
    story,
    highlights,
    transformation: {
      from: transformation.from.trim(),
      to: transformation.to.trim(),
      arc: transformation.arc.trim(),
    },
    stats: {
      matchesWitnessed: memories.length,
      peakEvolution: ghost.evolutionScore,
      dominantMood,
      topMemory: celebration.title,
    },
    shareText,
    generatedAt: new Date().toISOString(),
    moments: { celebration, heartbreak, rivalry, fanIdentity },
  };
}

export function buildLegacySlides(
  ghost: GhostLegacyInput,
  legacy: LegacyDocument
): WrappedSlideData[] {
  const moments = legacy.moments!;

  return [
    {
      eyebrow: "GoalGhost Wrapped · FIFA 2026",
      headline: ghost.name,
      body: legacy.story,
      stat: ghost.team,
      statLabel: "Your nation. Your soul.",
      gradient: GRADIENTS[0],
      size: "hero",
    },
    {
      eyebrow: "Your biggest celebration",
      headline: moments.celebration.title,
      body: moments.celebration.body,
      stat: String(legacy.stats.matchesWitnessed),
      statLabel: "Memories that roared",
      gradient: GRADIENTS[1],
    },
    {
      eyebrow: "Your deepest heartbreak",
      headline: moments.heartbreak.title,
      body: moments.heartbreak.body,
      stat: `${ghost.confidence}%`,
      statLabel: "Conviction through the pain",
      gradient: GRADIENTS[2],
    },
    {
      eyebrow: "Your strongest rivalry",
      headline: moments.rivalry.title,
      body: moments.rivalry.body,
      stat: ghost.team,
      statLabel: "The badge on your chest",
      gradient: GRADIENTS[3],
    },
    {
      eyebrow: "How you transformed",
      headline: `${legacy.transformation.from} → ${legacy.transformation.to}`,
      body: legacy.transformation.arc,
      stat: String(legacy.stats.peakEvolution),
      statLabel: "Evolution score",
      gradient: GRADIENTS[4],
    },
    {
      eyebrow: "Your final fan identity",
      headline: moments.fanIdentity.title,
      body: moments.fanIdentity.body,
      stat: legacy.stats.dominantMood,
      statLabel: "Dominant mood",
      gradient: GRADIENTS[5],
    },
    {
      eyebrow: "The final whistle",
      headline: "Share your legacy",
      body: legacy.shareText,
      stat: "Forever",
      statLabel: "On 0G · yours alone",
      gradient: GRADIENTS[6],
    },
  ];
}