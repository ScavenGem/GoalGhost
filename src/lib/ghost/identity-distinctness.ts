import type { GhostTraits } from "@/types/ghost";
import { dominantTrait } from "@/lib/ghost/evolution";
import type { GhostMemorySnapshot } from "@/lib/ghost/avatar-visual-profile";

export type BanterStyle =
  | "fiery_debater"
  | "poetic_supporter"
  | "visual_banter"
  | "analytical_voice"
  | "loyal_chant_leader"
  | "quiet_observer";

export type ReactionPattern =
  | "celebration_driven"
  | "heartbreak_weighted"
  | "social_reactor"
  | "match_day_purist"
  | "balanced_fan";

export type CommentSignal = {
  text: string;
  scope?: "legacy" | "news";
  hasMedia?: boolean;
};

export type WalletIdentityProfile = {
  walletFingerprint: string;
  creationSeed: number;
  banterStyle: BanterStyle;
  reactionPattern: ReactionPattern;
  evolutionArchetype: string;
  personalityPresentation: string;
  expressionStyle: string;
  voiceSignature: string;
  visualAccentKey: string;
  nameEpithet: string;
  distinctnessDirectives: string;
  journeySignature: string;
  banterExcerpts: string[];
};

const EPITHETS = [
  "Sentinel",
  "Chant",
  "Flame",
  "Heartbeat",
  "Echo",
  "Captain",
  "Oracle",
  "Storm",
  "Pulse",
  "Guardian",
  "Roar",
  "Phantom",
  "Vanguard",
  "Witness",
  "Ember",
] as const;

const VOICE_SIGNATURES = [
  "Match-day raw, speaks in clipped terrace bursts",
  "Poetic and devotional, like a stadium hymn at full time",
  "Sharp and provocative, thrives on rivalry banter",
  "Calm analyst energy with sudden emotional spikes",
  "Loyal chant-leader cadence, always back to the crest",
  "Quiet intensity that erupts only when it matters",
  "Visual storyteller, lets images and GIFs do the talking",
  "Debate-first voice, never shy from the comments wall",
] as const;

const EXPRESSION_STYLES = [
  "steely focused gaze",
  "fervent open-mouth intensity",
  "reflective lowered brow",
  "defiant jaw-set determination",
  "euphoric lifted chin celebration",
  "devoted calm half-smile",
  "analytical narrowed eyes",
  "banter-fueled smirk energy",
] as const;

const VISUAL_ACCENTS = [
  "gold_rim_kit",
  "shadow_ghost_trail",
  "ember_reaction_sparks",
  "cool_blue_haze",
  "crimson_passion_glow",
  "emerald_hope_aura",
  "violet_drama_flare",
  "silver_resilience_edge",
] as const;

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick<T>(items: readonly T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length]!;
}

function walletFingerprint(walletAddress?: string): string {
  if (!walletAddress) return "anonymous-wallet";
  const w = walletAddress.toLowerCase();
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function analyzeBanterStyle(
  comments: CommentSignal[],
  traits: GhostTraits,
  seed: number
): BanterStyle {
  if (!comments.length) {
    const dom = dominantTrait(traits);
    if (dom === "drama") return "fiery_debater";
    if (dom === "loyalty") return "loyal_chant_leader";
    if (dom === "hope") return "poetic_supporter";
    if (dom === "passion") return pick(["fiery_debater", "loyal_chant_leader"], seed);
    if (dom === "resilience") return pick(["analytical_voice", "quiet_observer"], seed);
    return pick(
      [
        "poetic_supporter",
        "loyal_chant_leader",
        "analytical_voice",
        "quiet_observer",
      ] as const,
      seed
    );
  }

  const mediaCount = comments.filter((c) => c.hasMedia).length;
  if (mediaCount >= Math.max(1, Math.floor(comments.length / 3))) {
    return "visual_banter";
  }

  const joined = comments.map((c) => c.text).join(" ");
  const capsRatio =
    (joined.match(/[A-Z]/g)?.length ?? 0) / Math.max(joined.length, 1);
  const exclamations = (joined.match(/!/g) ?? []).length;
  const debateWords =
    /rival|trash|best|worst|overrated|debate|disagree|never|always|clown|goat/i.test(
      joined
    );
  const avgLen =
    comments.reduce((sum, c) => sum + c.text.length, 0) / comments.length;

  if (debateWords || capsRatio > 0.12 || exclamations >= 3) return "fiery_debater";
  if (avgLen >= 120) return "analytical_voice";
  if (/love|heart|forever|believe|dream|hope|soul|spirit/i.test(joined)) {
    return "poetic_supporter";
  }
  if (avgLen < 40) return "loyal_chant_leader";
  return "quiet_observer";
}

function analyzeReactionPattern(memories: GhostMemorySnapshot[]): ReactionPattern {
  const social = memories.filter((m) => m.type === "social_reaction").length;
  const socialComments = memories.filter((m) => m.type === "social_comment").length;
  const matches = memories.filter((m) => m.type === "match_reaction").length;

  const celebratory = memories.filter((m) =>
    /euphor|celebrat|charged|legendary|fervent/i.test(
      `${m.emotionalTone} ${m.title} ${m.content}`
    )
  ).length;
  const heartbreak = memories.filter((m) =>
    /deflat|heartbreak|loss|defiant|reflective|sad/i.test(
      `${m.emotionalTone} ${m.title} ${m.content}`
    )
  ).length;

  if (social >= 3 || (socialComments >= 2 && social >= 1)) return "social_reactor";
  if (celebratory > heartbreak + 1) return "celebration_driven";
  if (heartbreak > celebratory + 1) return "heartbreak_weighted";
  if (matches >= 3 && social < 2) return "match_day_purist";
  return "balanced_fan";
}

function evolutionArchetype(
  score: number,
  pattern: ReactionPattern,
  banter: BanterStyle
): string {
  const stage =
    score >= 80
      ? "Legend"
      : score >= 50
        ? "Veteran"
        : score >= 25
          ? "Awakened"
          : score > 0
            ? "Growing"
            : "Newborn";

  return `${stage} ${pattern.replace(/_/g, " ")} with ${banter.replace(/_/g, " ")} energy`;
}

function personalityPresentation(
  traits: GhostTraits,
  banter: BanterStyle,
  pattern: ReactionPattern,
  mood: string
): string {
  const dom = dominantTrait(traits);
  const banterNote: Record<BanterStyle, string> = {
    fiery_debater: "confrontational banter-first supporter who lives in the comments wall",
    poetic_supporter: "lyrical devotee who turns feelings into stadium poetry",
    visual_banter: "image-driven fan who speaks through GIFs, photos, and visual provocation",
    analytical_voice: "tactical observer who narrates the tournament like a scout notebook",
    loyal_chant_leader: "crest-first loyalist with terrace chant energy in every sentence",
    quiet_observer: "still-water fan whose rare eruptions hit harder than constant noise",
  };
  const patternNote: Record<ReactionPattern, string> = {
    celebration_driven: "chases euphoric highs and wears victories on the sleeve",
    heartbreak_weighted: "carries losses visibly and lets pain sharpen identity",
    social_reactor: "feeds on emoji reactions and signed social energy",
    match_day_purist: "lives through kickoffs more than threads",
    balanced_fan: "mixes match emotion with social banter in equal measure",
  };

  return `Dominant ${dom} (${traits[dom]}/100), ${banterNote[banter]}, ${patternNote[pattern]}, current mood ${mood}.`;
}

function buildJourneySignature(
  memories: GhostMemorySnapshot[],
  comments: CommentSignal[]
): string {
  const parts: string[] = [];
  const types = new Map<string, number>();
  for (const m of memories) {
    if (!m.type) continue;
    types.set(m.type, (types.get(m.type) ?? 0) + 1);
  }
  for (const [type, count] of types) {
    parts.push(`${count} ${type.replace(/_/g, " ")}`);
  }
  if (comments.length) parts.push(`${comments.length} signed comments`);
  return parts.length ? parts.join(", ") : "newborn journey awaiting first interaction";
}

export function analyzeWalletIdentity(params: {
  walletAddress?: string;
  traits?: GhostTraits;
  mood?: string;
  evolutionScore?: number;
  confidence?: number;
  memories?: GhostMemorySnapshot[];
  comments?: CommentSignal[];
}): WalletIdentityProfile {
  const traits = params.traits ?? {
    passion: 70,
    loyalty: 70,
    drama: 50,
    hope: 70,
    resilience: 65,
  };
  const mood = params.mood ?? "electric";
  const memories = params.memories ?? [];
  const comments = params.comments ?? [];
  const wallet = params.walletAddress?.toLowerCase() ?? "";
  const seed = hashSeed(
    `${wallet}::${JSON.stringify(traits)}::${mood}::${params.evolutionScore ?? 0}::${memories.map((m) => `${m.type}:${m.title}:${m.evolutionDelta}`).join("|")}::${comments.map((c) => c.text).join("|")}`
  );

  const banterStyle = analyzeBanterStyle(comments, traits, seed);
  const reactionPattern = analyzeReactionPattern(memories);
  const archetype = evolutionArchetype(
    params.evolutionScore ?? 0,
    reactionPattern,
    banterStyle
  );
  const presentation = personalityPresentation(
    traits,
    banterStyle,
    reactionPattern,
    mood
  );

  const banterExcerpts = comments
    .slice(-5)
    .map((c) => c.text.trim())
    .filter(Boolean);

  const journeySignature = buildJourneySignature(memories, comments);

  const distinctnessDirectives = [
    "CRITICAL: This GoalGhost must feel unmistakably unique to this wallet. No generic football fan avatar.",
    `Wallet fingerprint: ${walletFingerprint(wallet)}. Never reuse naming, voice, or visual cues from other users.`,
    `Banter style: ${banterStyle.replace(/_/g, " ")}.`,
    `Reaction pattern: ${reactionPattern.replace(/_/g, " ")}.`,
    `Evolution archetype: ${archetype}.`,
    `Personality presentation: ${presentation}`,
    banterExcerpts.length
      ? `Actual signed banter to echo: "${banterExcerpts.join('" · "')}"`
      : "No signed banter yet: differentiate through trait sliders and wallet fingerprint only.",
    `Journey signature: ${journeySignature}.`,
    "Two users from the same country with different activity must look and sound clearly different in mood, kit details, expression, and narrative voice.",
  ].join(" ");

  return {
    walletFingerprint: walletFingerprint(wallet),
    creationSeed: seed,
    banterStyle,
    reactionPattern,
    evolutionArchetype: archetype,
    personalityPresentation: presentation,
    expressionStyle: pick(EXPRESSION_STYLES, seed, 3),
    voiceSignature: pick(VOICE_SIGNATURES, seed, 5),
    visualAccentKey: pick(VISUAL_ACCENTS, seed, 7),
    nameEpithet: pick(EPITHETS, seed, 1),
    distinctnessDirectives,
    journeySignature,
    banterExcerpts,
  };
}

/** Zod-compatible shape for API routes accepting wallet identity. */
export const WALLET_IDENTITY_KEYS = [
  "walletFingerprint",
  "creationSeed",
  "banterStyle",
  "reactionPattern",
  "evolutionArchetype",
  "personalityPresentation",
  "expressionStyle",
  "voiceSignature",
  "visualAccentKey",
  "nameEpithet",
  "distinctnessDirectives",
  "journeySignature",
  "banterExcerpts",
] as const;

export function creationIdentityName(
  team: string,
  identity: WalletIdentityProfile
): string {
  const words = team.split(/\s+/).filter(Boolean);
  const lead = words.length > 1 ? words[words.length - 1] : team;
  const titled = lead.charAt(0).toUpperCase() + lead.slice(1).toLowerCase();
  return `${titled} ${identity.nameEpithet}`;
}