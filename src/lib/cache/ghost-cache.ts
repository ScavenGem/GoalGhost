import { prisma } from "@/lib/db/prisma";
import type { GhostTraits } from "@/types/ghost";
import {
  computeConfidenceDelta,
  mergeTraitDelta,
  parseGhostTraits,
  type TraitDelta,
} from "@/lib/ghost/evolution";

const CACHE_TTL_MS = 15 * 60 * 1000;

export async function upsertGhostCache(data: {
  tokenId: number;
  walletAddress: string;
  profileRoot: string;
  team: string;
  name: string;
  evolutionScore?: number;
  confidence?: number;
  mood?: string;
  traits?: GhostTraits | null;
}) {
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  const wallet = data.walletAddress.toLowerCase();
  const traitsJson = data.traits ?? undefined;

  return prisma.ghostCache.upsert({
    where: { walletAddress: wallet },
    create: {
      ...data,
      walletAddress: wallet,
      evolutionScore: data.evolutionScore ?? 0,
      confidence: data.confidence ?? 50,
      mood: data.mood ?? "calm",
      traits: traitsJson,
      expiresAt,
    },
    update: {
      tokenId: data.tokenId,
      profileRoot: data.profileRoot,
      team: data.team,
      name: data.name,
      mood: data.mood ?? "calm",
      confidence: data.confidence ?? 50,
      traits: traitsJson ?? undefined,
      cachedAt: new Date(),
      expiresAt,
    },
  });
}

export async function getGhostByWallet(wallet: string) {
  const ghost = await prisma.ghostCache.findUnique({
    where: { walletAddress: wallet.toLowerCase() },
    include: { memories: { orderBy: { occurredAt: "asc" }, take: 50 } },
  });

  if (!ghost) return null;

  return {
    ...ghost,
    traits: parseGhostTraits(ghost.traits),
  };
}

export async function getGhostByTokenId(tokenId: number) {
  const ghost = await prisma.ghostCache.findUnique({
    where: { tokenId },
    include: { memories: { orderBy: { occurredAt: "asc" }, take: 50 } },
  });

  if (!ghost) return null;

  return {
    ...ghost,
    traits: parseGhostTraits(ghost.traits),
  };
}

export async function getLegacyRootHash(tokenId: number): Promise<string | null> {
  const memory = await prisma.memoryIndex.findUnique({
    where: { eventId: `legacy-${tokenId}` },
    select: { rootHash: true },
  });
  return memory?.rootHash ?? null;
}

export async function indexMemory(data: {
  tokenId: number;
  eventId: string;
  type: string;
  title?: string;
  content?: string;
  emotionalTone?: string;
  evolutionDelta?: number;
  matchId?: string;
  rootHash: string;
  occurredAt: Date;
}) {
  return prisma.memoryIndex.upsert({
    where: { eventId: data.eventId },
    create: data,
    update: {
      rootHash: data.rootHash,
      title: data.title,
      content: data.content,
      emotionalTone: data.emotionalTone,
      evolutionDelta: data.evolutionDelta,
      cachedAt: new Date(),
    },
  });
}

export async function updateGhostStats(
  tokenId: number,
  delta: {
    evolutionDelta?: number;
    confidenceDelta?: number;
    mood?: string;
    traitDelta?: TraitDelta;
  }
) {
  const ghost = await prisma.ghostCache.findUnique({ where: { tokenId } });
  if (!ghost) return null;

  const evolutionDelta = delta.evolutionDelta ?? 0;
  const confidenceDelta =
    delta.confidenceDelta ?? computeConfidenceDelta(evolutionDelta);
  const currentTraits = parseGhostTraits(ghost.traits);
  const nextTraits = delta.traitDelta
    ? mergeTraitDelta(currentTraits, delta.traitDelta)
    : currentTraits;

  return prisma.ghostCache.update({
    where: { tokenId },
    data: {
      evolutionScore: ghost.evolutionScore + evolutionDelta,
      confidence: Math.min(
        100,
        Math.max(0, ghost.confidence + confidenceDelta)
      ),
      mood: delta.mood ?? ghost.mood,
      traits: nextTraits ?? undefined,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
  });
}