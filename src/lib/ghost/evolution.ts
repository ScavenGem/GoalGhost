import type { GhostTraits } from "@/types/ghost";

export type EvolutionStage =
  | "Newborn"
  | "Growing"
  | "Awakened"
  | "Veteran"
  | "Legend";

export type TraitKey = keyof GhostTraits;

export type TraitDelta = Partial<Record<TraitKey, number>>;

export type InteractionKind =
  | "legacy_comment"
  | "legacy_comment_reply"
  | "news_comment"
  | "news_comment_reply"
  | "legacy_comment_media"
  | "news_comment_media"
  | "comment_emoji_reaction"
  | "legacy_seal"
  | "evolve_narrative";

export type CommentEmojiId =
  | "fire"
  | "heart"
  | "football"
  | "sad"
  | "celebration";

export type InteractionEvolutionPayload = {
  memoryType: string;
  title: string;
  content: string;
  emotionalTone: string;
  evolutionDelta: number;
  confidenceDelta: number;
  mood: string;
  traitDelta: TraitDelta;
};

const DEFAULT_TRAITS: GhostTraits = {
  passion: 70,
  loyalty: 70,
  drama: 50,
  hope: 70,
  resilience: 65,
};

export function ghostEvolutionStage(score: number): EvolutionStage {
  if (score >= 80) return "Legend";
  if (score >= 50) return "Veteran";
  if (score >= 25) return "Awakened";
  if (score > 0) return "Growing";
  return "Newborn";
}

export function computeConfidenceDelta(evolutionDelta: number): number {
  return Math.round(evolutionDelta * 0.8);
}

export function clampTrait(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function parseGhostTraits(raw: unknown): GhostTraits | null {
  if (!raw || typeof raw !== "object") return null;
  const t = raw as Record<string, unknown>;
  const keys: TraitKey[] = ["passion", "loyalty", "drama", "hope", "resilience"];
  if (!keys.every((k) => typeof t[k] === "number")) return null;
  return {
    passion: clampTrait(t.passion as number),
    loyalty: clampTrait(t.loyalty as number),
    drama: clampTrait(t.drama as number),
    hope: clampTrait(t.hope as number),
    resilience: clampTrait(t.resilience as number),
  };
}

export function mergeTraitDelta(
  traits: GhostTraits | null | undefined,
  delta: TraitDelta
): GhostTraits {
  const base = traits ?? DEFAULT_TRAITS;
  return {
    passion: clampTrait(base.passion + (delta.passion ?? 0)),
    loyalty: clampTrait(base.loyalty + (delta.loyalty ?? 0)),
    drama: clampTrait(base.drama + (delta.drama ?? 0)),
    hope: clampTrait(base.hope + (delta.hope ?? 0)),
    resilience: clampTrait(base.resilience + (delta.resilience ?? 0)),
  };
}

export function dominantTrait(traits: GhostTraits): TraitKey {
  return Object.entries(traits).sort((a, b) => b[1] - a[1])[0][0] as TraitKey;
}

function reactionTraitDelta(emojiId: CommentEmojiId): TraitDelta {
  switch (emojiId) {
    case "fire":
      return { passion: 2, drama: 1 };
    case "heart":
      return { loyalty: 2, hope: 1 };
    case "football":
      return { loyalty: 1, passion: 1 };
    case "sad":
      return { resilience: 2, drama: 1 };
    case "celebration":
      return { passion: 2, hope: 2 };
  }
}

function reactionMood(emojiId: CommentEmojiId): string {
  switch (emojiId) {
    case "fire":
      return "fervent";
    case "heart":
      return "devoted";
    case "football":
      return "charged";
    case "sad":
      return "reflective";
    case "celebration":
      return "euphoric";
  }
}

export function computeEvolveNarrativeDelta(contextLines: number): number {
  const base = 5;
  const bonus = Math.min(8, Math.floor(contextLines / 4));
  return base + bonus;
}

export function evolveTraitDeltaFromContext(contextLines: number): TraitDelta {
  if (contextLines >= 20) {
    return { passion: 2, loyalty: 2, drama: 1, hope: 2, resilience: 2 };
  }
  if (contextLines >= 10) {
    return { passion: 1, loyalty: 1, hope: 1, resilience: 1 };
  }
  return { hope: 1 };
}

export function buildInteractionEvolution(
  kind: InteractionKind,
  context: {
    text?: string;
    scope?: "legacy" | "news";
    emojiId?: CommentEmojiId;
    isReply?: boolean;
    hasMedia?: boolean;
    mediaType?: string | null;
  } = {}
): InteractionEvolutionPayload {
  const snippet = context.text?.trim().slice(0, 120) ?? "";
  const scopeLabel = context.scope === "news" ? "World Cup news" : "legacy wall";

  if (kind === "comment_emoji_reaction" && context.emojiId) {
    const delta = 2;
    return {
      memoryType: "social_reaction",
      title: `Signed ${context.emojiId} reaction`,
      content: `Your ghost felt a ${context.emojiId} pulse ripple through the ${scopeLabel}. Every reaction you leave sharpens conviction.`,
      emotionalTone: reactionMood(context.emojiId),
      evolutionDelta: delta,
      confidenceDelta: computeConfidenceDelta(delta),
      mood: reactionMood(context.emojiId),
      traitDelta: reactionTraitDelta(context.emojiId),
    };
  }

  if (kind === "legacy_seal") {
    const delta = 10;
    return {
      memoryType: "legacy",
      title: "Legacy unwrapped",
      content:
        "Your tournament Spirit was narrated and sealed. The ghost carries the full weight of every chapter you lived.",
      emotionalTone: "legendary",
      evolutionDelta: delta,
      confidenceDelta: computeConfidenceDelta(delta),
      mood: "legendary",
      traitDelta: { loyalty: 3, passion: 2, hope: 2, resilience: 2 },
    };
  }

  if (kind === "evolve_narrative") {
    const delta = 6;
    return {
      memoryType: "evolution_checkpoint",
      title: "Narrative Evolution",
      content: "Identity chapter sealed from your cumulative fan journey.",
      emotionalTone: "reflective",
      evolutionDelta: delta,
      confidenceDelta: computeConfidenceDelta(delta),
      mood: "reflective",
      traitDelta: { hope: 1, resilience: 1 },
    };
  }

  const hasMedia = context.hasMedia ?? false;
  const isReply = context.isReply ?? false;
  const isNews = context.scope === "news";

  if (hasMedia) {
    const delta = isReply ? 4 : 6;
    const mediaLabel = context.mediaType === "gif" ? "GIF" : "image";
    return {
      memoryType: "social_comment",
      title: isReply ? `Visual reply on ${scopeLabel}` : `Visual banter on ${scopeLabel}`,
      content: snippet
        ? `${snippet}${snippet.length >= 120 ? "…" : ""} · sealed with a ${mediaLabel}`
        : `A signed ${mediaLabel} on the ${scopeLabel} pushed your ghost forward.`,
      emotionalTone: "expressive",
      evolutionDelta: delta,
      confidenceDelta: computeConfidenceDelta(delta),
      mood: "expressive",
      traitDelta: { drama: 2, passion: 2, loyalty: 1 },
    };
  }

  const delta = isReply ? 3 : 4;
  return {
    memoryType: "social_comment",
    title: isReply ? `Reply on ${scopeLabel}` : `Banter on ${scopeLabel}`,
    content: snippet
      ? snippet + (snippet.length >= 120 ? "…" : "")
      : `A signed note on the ${scopeLabel} became part of your ghost's story.`,
    emotionalTone: isNews ? "debating" : "bantering",
    evolutionDelta: delta,
    confidenceDelta: computeConfidenceDelta(delta),
    mood: isNews ? "debating" : "bantering",
    traitDelta: isReply
      ? { loyalty: 1, drama: 1 }
      : { drama: 2, passion: 1, loyalty: 1 },
  };
}

export function applyEvolutionToGhost<
  T extends {
    evolutionScore: number;
    confidence: number;
    mood: string;
    traits?: GhostTraits | null;
  },
>(ghost: T, payload: InteractionEvolutionPayload): T {
  return {
    ...ghost,
    evolutionScore: ghost.evolutionScore + payload.evolutionDelta,
    confidence: Math.min(100, ghost.confidence + payload.confidenceDelta),
    mood: payload.mood,
    traits: mergeTraitDelta(ghost.traits, payload.traitDelta),
  };
}