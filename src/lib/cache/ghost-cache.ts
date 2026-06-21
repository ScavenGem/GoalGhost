import { prisma } from "@/lib/db/prisma";

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
}) {
  const expiresAt = new Date(Date.now() + CACHE_TTL_MS);
  const wallet = data.walletAddress.toLowerCase();
  return prisma.ghostCache.upsert({
    where: { walletAddress: wallet },
    create: {
      ...data,
      walletAddress: wallet,
      evolutionScore: data.evolutionScore ?? 0,
      confidence: data.confidence ?? 50,
      mood: data.mood ?? "calm",
      expiresAt,
    },
    update: {
      tokenId: data.tokenId,
      profileRoot: data.profileRoot,
      team: data.team,
      name: data.name,
      mood: data.mood ?? "calm",
      confidence: data.confidence ?? 50,
      cachedAt: new Date(),
      expiresAt,
    },
  });
}

export async function getGhostByWallet(wallet: string) {
  return prisma.ghostCache.findUnique({
    where: { walletAddress: wallet.toLowerCase() },
    include: { memories: { orderBy: { occurredAt: "asc" }, take: 50 } },
  });
}

export async function getGhostByTokenId(tokenId: number) {
  return prisma.ghostCache.findUnique({
    where: { tokenId },
    include: { memories: { orderBy: { occurredAt: "asc" }, take: 50 } },
  });
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
      cachedAt: new Date(),
    },
  });
}

export async function updateGhostStats(
  tokenId: number,
  delta: { evolutionDelta?: number; confidenceDelta?: number; mood?: string }
) {
  const ghost = await prisma.ghostCache.findUnique({ where: { tokenId } });
  if (!ghost) return null;

  return prisma.ghostCache.update({
    where: { tokenId },
    data: {
      evolutionScore: ghost.evolutionScore + (delta.evolutionDelta ?? 0),
      confidence: Math.min(
        100,
        Math.max(0, ghost.confidence + (delta.confidenceDelta ?? 0))
      ),
      mood: delta.mood ?? ghost.mood,
      cachedAt: new Date(),
      expiresAt: new Date(Date.now() + CACHE_TTL_MS),
    },
  });
}