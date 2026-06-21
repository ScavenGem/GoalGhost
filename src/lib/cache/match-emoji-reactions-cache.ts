import { prisma } from "@/lib/db/prisma";
import { MATCH_EMOJI_REACTIONS } from "@/lib/match-reactions/types";
import type { MatchEmojiReactionId } from "@/lib/match-reactions/types";
import {
  EMPTY_EMOJI_COUNTS,
  type MatchEmojiReactionCounts,
  type MatchEmojiReactionSummary,
} from "@/types/match-emoji-reaction";

const REACTION_IDS = MATCH_EMOJI_REACTIONS.map((r) => r.id);

function emptyCounts(): MatchEmojiReactionCounts {
  return { ...EMPTY_EMOJI_COUNTS };
}

function isReactionId(value: string): value is MatchEmojiReactionId {
  return REACTION_IDS.includes(value as MatchEmojiReactionId);
}

export async function getMatchEmojiReactionSummaries(
  matchIds: string[],
  walletAddress?: string
): Promise<Record<string, MatchEmojiReactionSummary>> {
  const summaries: Record<string, MatchEmojiReactionSummary> = {};
  for (const matchId of matchIds) {
    summaries[matchId] = { counts: emptyCounts(), userReaction: null };
  }

  if (matchIds.length === 0) return summaries;

  const rows = await prisma.matchEmojiReaction.findMany({
    where: { matchId: { in: matchIds } },
    select: { matchId: true, reactionId: true, walletAddress: true },
  });

  const wallet = walletAddress?.toLowerCase();

  for (const row of rows) {
    const summary = summaries[row.matchId];
    if (!summary || !isReactionId(row.reactionId)) continue;
    summary.counts[row.reactionId] += 1;
    if (wallet && row.walletAddress === wallet) {
      summary.userReaction = row.reactionId;
    }
  }

  return summaries;
}

export async function upsertMatchEmojiReaction(data: {
  matchId: string;
  walletAddress: string;
  reactionId: MatchEmojiReactionId;
  signature: string;
  rootHash?: string;
  createdAt: Date;
}) {
  const wallet = data.walletAddress.toLowerCase();

  return prisma.matchEmojiReaction.upsert({
    where: {
      matchId_walletAddress: {
        matchId: data.matchId,
        walletAddress: wallet,
      },
    },
    create: {
      matchId: data.matchId,
      walletAddress: wallet,
      reactionId: data.reactionId,
      signature: data.signature,
      rootHash: data.rootHash,
      createdAt: data.createdAt,
      updatedAt: data.createdAt,
    },
    update: {
      reactionId: data.reactionId,
      signature: data.signature,
      rootHash: data.rootHash,
      updatedAt: data.createdAt,
    },
  });
}