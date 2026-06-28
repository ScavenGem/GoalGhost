import {
  getGhostByWallet,
  indexMemory,
  updateGhostStats,
} from "@/lib/cache/ghost-cache";
import {
  buildInteractionEvolution,
  parseGhostTraits,
  type CommentEmojiId,
  type InteractionEvolutionPayload,
  type InteractionKind,
  type TraitDelta,
} from "@/lib/ghost/evolution";
import type { GhostTraits } from "@/types/ghost";

export type InteractionEvolutionResult = {
  eventId: string;
  evolutionDelta: number;
  confidenceDelta: number;
  mood: string;
  memoryType: string;
  title: string;
  content: string;
  emotionalTone: string;
  evolutionScore: number;
  confidence: number;
  traits: GhostTraits | null;
  traitDelta: TraitDelta;
};

type RegisterParams = {
  walletAddress: string;
  kind: InteractionKind;
  eventId: string;
  rootHash: string;
  occurredAt: string;
  text?: string;
  scope?: "legacy" | "news";
  emojiId?: CommentEmojiId;
  isReply?: boolean;
  hasMedia?: boolean;
  mediaType?: string | null;
  payloadOverride?: Partial<InteractionEvolutionPayload>;
};

export async function registerInteractionEvolution(
  params: RegisterParams
): Promise<InteractionEvolutionResult | null> {
  const ghost = await getGhostByWallet(params.walletAddress);
  if (!ghost) return null;

  const base = buildInteractionEvolution(params.kind, {
    text: params.text,
    scope: params.scope,
    emojiId: params.emojiId,
    isReply: params.isReply,
    hasMedia: params.hasMedia,
    mediaType: params.mediaType,
  });

  const payload: InteractionEvolutionPayload = {
    ...base,
    ...params.payloadOverride,
    traitDelta: {
      ...base.traitDelta,
      ...params.payloadOverride?.traitDelta,
    },
  };

  await indexMemory({
    tokenId: ghost.tokenId,
    eventId: params.eventId,
    type: payload.memoryType,
    title: payload.title,
    content: payload.content,
    emotionalTone: payload.emotionalTone,
    rootHash: params.rootHash,
    occurredAt: new Date(params.occurredAt),
    evolutionDelta: payload.evolutionDelta,
  });

  const updated = await updateGhostStats(ghost.tokenId, {
    evolutionDelta: payload.evolutionDelta,
    confidenceDelta: payload.confidenceDelta,
    mood: payload.mood,
    traitDelta: payload.traitDelta,
  });

  if (!updated) return null;

  return {
    eventId: params.eventId,
    evolutionDelta: payload.evolutionDelta,
    confidenceDelta: payload.confidenceDelta,
    mood: payload.mood,
    memoryType: payload.memoryType,
    title: payload.title,
    content: payload.content,
    emotionalTone: payload.emotionalTone,
    evolutionScore: updated.evolutionScore,
    confidence: updated.confidence,
    traits: parseGhostTraits(updated.traits),
    traitDelta: payload.traitDelta,
  };
}