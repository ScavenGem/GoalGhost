import type { GhostTraits } from "@/types/ghost";
import {
  dominantTrait,
  ghostEvolutionStage,
  type EvolutionStage,
} from "@/lib/ghost/evolution";

export type GhostMemorySnapshot = {
  type?: string;
  title?: string;
  content?: string;
  emotionalTone?: string;
  evolutionDelta?: number;
};

export type AvatarPose =
  | "match_ready"
  | "celebration"
  | "clutch_ball"
  | "defiant"
  | "legendary_float";

export type AvatarVisualProfile = {
  stage: EvolutionStage;
  tier: 0 | 1 | 2 | 3 | 4;
  seed: number;
  dominantTrait: keyof GhostTraits;
  mood: string;
  traits: GhostTraits;
  conviction: number;
  interactionIntensity: number;
  totalEvolutionGain: number;
  kitDetailLevel: number;
  auraIntensity: number;
  ghostOpacity: number;
  floatHeight: number;
  presenceScale: number;
  pose: AvatarPose;
  hasCaptainBand: boolean;
  hasScarf: boolean;
  hasMediaGlow: boolean;
  hasCommentEnergy: boolean;
  hasReactionSparks: boolean;
  hasLegendHalo: boolean;
  hasStadiumHaze: boolean;
  interactionSummary: string;
  visualDirectives: string;
  memoryFingerprint: string;
};

const DEFAULT_TRAITS: GhostTraits = {
  passion: 70,
  loyalty: 70,
  drama: 50,
  hope: 70,
  resilience: 65,
};

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function evolutionTier(score: number): 0 | 1 | 2 | 3 | 4 {
  if (score >= 80) return 4;
  if (score >= 50) return 3;
  if (score >= 25) return 2;
  if (score > 0) return 1;
  return 0;
}

function countByType(memories: GhostMemorySnapshot[], type: string): number {
  return memories.filter((m) => m.type === type).length;
}

function intenseInteractionScore(memories: GhostMemorySnapshot[]): number {
  return memories.reduce((sum, m) => {
    const delta = m.evolutionDelta ?? 0;
    const tone = (m.emotionalTone ?? "").toLowerCase();
    const intense =
      delta >= 5 ||
      ["fervent", "euphoric", "legendary", "charged", "expressive", "defiant"].includes(
        tone
      );
    return sum + (intense ? delta + 2 : delta > 0 ? 1 : 0);
  }, 0);
}

function buildInteractionSummary(memories: GhostMemorySnapshot[]): string {
  if (!memories.length) {
    return "Freshly born: no signed comments, banter, reactions, or legacy moments yet.";
  }

  const highlights = memories
    .slice(-8)
    .map((m) => {
      const label =
        m.type === "social_comment"
          ? "banter"
          : m.type === "social_reaction"
            ? "reaction"
            : m.type === "match_reaction"
              ? "match felt"
              : m.type === "evolution_checkpoint"
                ? "evolution"
                : m.type === "legacy"
                  ? "legacy"
                  : (m.type ?? "moment");
      const title = m.title?.trim();
      const tone = m.emotionalTone ? ` (${m.emotionalTone})` : "";
      const gain = m.evolutionDelta ? ` +${m.evolutionDelta}` : "";
      return title ? `${label}: ${title}${tone}${gain}` : `${label}${tone}${gain}`;
    })
    .join("; ");

  const social = countByType(memories, "social_comment");
  const reactions = countByType(memories, "social_reaction");
  const matches = countByType(memories, "match_reaction");

  return `${highlights}. Journey density: ${social} signed comments, ${reactions} reactions, ${matches} kickoffs felt.`;
}

function resolvePose(
  mood: string,
  tier: number,
  memories: GhostMemorySnapshot[],
  dominant: keyof GhostTraits
): AvatarPose {
  const summary = memories
    .map((m) => `${m.title} ${m.content} ${m.emotionalTone}`)
    .join(" ")
    .toLowerCase();

  if (tier >= 4) return "legendary_float";
  if (/celebrat|victory|euphor|comeback|goal/.test(summary) || mood === "euphoric") {
    return "celebration";
  }
  if (mood === "defiant" || mood === "fierce" || dominant === "resilience") {
    return "defiant";
  }
  if (tier >= 2 && (dominant === "passion" || mood === "charged" || mood === "fervent")) {
    return "clutch_ball";
  }
  return "match_ready";
}

export function buildAvatarVisualProfile(params: {
  name: string;
  team: string;
  teamCode?: string;
  walletAddress?: string;
  traits?: GhostTraits;
  mood?: string;
  evolutionScore?: number;
  confidence?: number;
  memories?: GhostMemorySnapshot[];
  memorySummary?: string;
}): AvatarVisualProfile {
  const traits = params.traits ?? DEFAULT_TRAITS;
  const mood = params.mood ?? "electric";
  const evolutionScore = params.evolutionScore ?? 0;
  const conviction = params.confidence ?? 50;
  const memories = params.memories ?? [];
  const tier = evolutionTier(evolutionScore);
  const stage = ghostEvolutionStage(evolutionScore);
  const dom = dominantTrait(traits);

  const socialComments = countByType(memories, "social_comment");
  const socialReactions = countByType(memories, "social_reaction");
  const matchReactions = countByType(memories, "match_reaction");
  const checkpoints = countByType(memories, "evolution_checkpoint");
  const legacyMoments = countByType(memories, "legacy");
  const totalEvolutionGain = memories.reduce(
    (sum, m) => sum + (m.evolutionDelta ?? 0),
    0
  );
  const intensityRaw =
    socialComments * 4 +
    socialReactions * 2 +
    matchReactions * 3 +
    checkpoints * 5 +
    legacyMoments * 8 +
    intenseInteractionScore(memories) +
    Math.floor(conviction / 10);
  const interactionIntensity = Math.min(100, intensityRaw);

  const memoryFingerprint =
    params.memorySummary?.trim() ||
    memories
      .map((m) => `${m.type}:${m.title}:${m.evolutionDelta}:${m.emotionalTone}`)
      .join("|");

  const seed = hashSeed(
    [
      params.walletAddress ?? "",
      params.name,
      params.team,
      params.teamCode ?? "",
      mood,
      stage,
      String(evolutionScore),
      String(conviction),
      memoryFingerprint,
      JSON.stringify(traits),
    ].join("::")
  );

  const kitDetailLevel = Math.min(
    5,
    tier + Math.floor(interactionIntensity / 25) + (conviction >= 70 ? 1 : 0)
  );
  const auraIntensity = Math.min(
    1,
    0.12 + tier * 0.12 + interactionIntensity / 200 + (conviction >= 80 ? 0.1 : 0)
  );
  const ghostOpacity = Math.min(0.94, 0.62 + tier * 0.07 + conviction / 500);
  const floatHeight = tier * 2 + (interactionIntensity >= 40 ? 2 : 0);
  const presenceScale = 1 + tier * 0.015 + interactionIntensity / 2000;

  const hasMediaGlow = memories.some(
    (m) =>
      m.type === "social_comment" &&
      /visual|gif|image|media/i.test(`${m.title} ${m.content}`)
  );
  const hasCommentEnergy = socialComments >= 2 || socialReactions >= 1;
  const hasReactionSparks =
    socialReactions >= 2 ||
    matchReactions >= 3 ||
    memories.some((m) => (m.evolutionDelta ?? 0) >= 5);
  const hasLegendHalo = tier >= 4 || legacyMoments > 0;
  const hasCaptainBand =
    tier >= 4 || (tier >= 3 && traits.loyalty >= 78) || conviction >= 85;
  const hasScarf =
    tier >= 3 && (traits.passion >= 72 || traits.drama >= 75 || hasCommentEnergy);
  const hasStadiumHaze = tier >= 1;

  const pose = resolvePose(mood, tier, memories, dom);
  const interactionSummary = buildInteractionSummary(memories);

  const visualDirectives = [
    `Evolution stage ${stage} with kit detail level ${kitDetailLevel}/5.`,
    `Conviction ${conviction}% drives posture intensity and facial resolve.`,
    `Dominant personality: ${dom} (${traits[dom]}/100).`,
    `Interaction intensity ${interactionIntensity}/100 from ${socialComments} comments, ${socialReactions} reactions, ${matchReactions} match moments.`,
    `Pose: ${pose.replace(/_/g, " ")}.`,
    hasLegendHalo ? "Legendary golden halo and championship presence." : null,
    hasCaptainBand ? "Captain armband, leadership aura." : null,
    hasMediaGlow ? "Visual banter energy: subtle media glow accents." : null,
    hasReactionSparks ? "High-energy reaction sparks from intense fan interactions." : null,
    hasCommentEnergy ? "Signed comment energy visible as ethereal text wisps." : null,
    auraIntensity >= 0.35 ? "Strong ghostly translucency and floating ethereal energy." : "Subtle ghost translucency over athletic football body.",
    `Total evolution gained: +${totalEvolutionGain}.`,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    stage,
    tier,
    seed,
    dominantTrait: dom,
    mood,
    traits,
    conviction,
    interactionIntensity,
    totalEvolutionGain,
    kitDetailLevel,
    auraIntensity,
    ghostOpacity,
    floatHeight,
    presenceScale,
    pose,
    hasCaptainBand,
    hasScarf,
    hasMediaGlow,
    hasCommentEnergy,
    hasReactionSparks,
    hasLegendHalo,
    hasStadiumHaze,
    interactionSummary,
    visualDirectives,
    memoryFingerprint,
  };
}

export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}