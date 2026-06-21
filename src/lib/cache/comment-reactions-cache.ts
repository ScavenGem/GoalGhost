import { prisma } from "@/lib/db/prisma";
import type { CommentScope } from "@/lib/comments/reaction-sign";
import {
  EMPTY_COMMENT_REACTION_COUNTS,
  type CommentEmojiId,
  type CommentReactions,
} from "@/types/social-comment";

const EMOJI_IDS: CommentEmojiId[] = [
  "fire",
  "heart",
  "football",
  "sad",
  "celebration",
];

function isEmojiId(value: string): value is CommentEmojiId {
  return EMOJI_IDS.includes(value as CommentEmojiId);
}

export async function getCommentReactionsForComments(
  scope: CommentScope,
  commentIds: string[],
  walletAddress?: string
): Promise<Record<string, CommentReactions>> {
  const result: Record<string, CommentReactions> = {};
  for (const id of commentIds) {
    result[id] = { counts: { ...EMPTY_COMMENT_REACTION_COUNTS }, userReaction: null };
  }
  if (commentIds.length === 0) return result;

  const rows = await prisma.commentReaction.findMany({
    where: { scope, commentId: { in: commentIds } },
    select: { commentId: true, emojiId: true, walletAddress: true },
  });

  const wallet = walletAddress?.toLowerCase();
  for (const row of rows) {
    const entry = result[row.commentId];
    if (!entry || !isEmojiId(row.emojiId)) continue;
    entry.counts[row.emojiId] += 1;
    if (wallet && row.walletAddress === wallet) {
      entry.userReaction = row.emojiId;
    }
  }

  return result;
}

export async function upsertCommentReaction(data: {
  scope: CommentScope;
  commentId: string;
  walletAddress: string;
  emojiId: CommentEmojiId;
  signature: string;
  createdAt: Date;
}) {
  const wallet = data.walletAddress.toLowerCase();
  return prisma.commentReaction.upsert({
    where: {
      scope_commentId_walletAddress: {
        scope: data.scope,
        commentId: data.commentId,
        walletAddress: wallet,
      },
    },
    create: {
      scope: data.scope,
      commentId: data.commentId,
      walletAddress: wallet,
      emojiId: data.emojiId,
      signature: data.signature,
      createdAt: data.createdAt,
    },
    update: {
      emojiId: data.emojiId,
      signature: data.signature,
      createdAt: data.createdAt,
    },
  });
}

export async function removeCommentReaction(data: {
  scope: CommentScope;
  commentId: string;
  walletAddress: string;
}) {
  try {
    await prisma.commentReaction.delete({
      where: {
        scope_commentId_walletAddress: {
          scope: data.scope,
          commentId: data.commentId,
          walletAddress: data.walletAddress.toLowerCase(),
        },
      },
    });
    return true;
  } catch {
    return false;
  }
}