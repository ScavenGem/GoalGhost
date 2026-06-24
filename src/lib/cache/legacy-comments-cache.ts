import { prisma } from "@/lib/db/prisma";
import { getCommentReactionsForComments } from "@/lib/cache/comment-reactions-cache";
import { commentMediaUrl } from "@/lib/comments/media";
import type { LegacyComment } from "@/types/legacy-comment";
import {
  EMPTY_COMMENT_REACTION_COUNTS,
  type CommentMediaType,
  type CommentReactions,
} from "@/types/social-comment";

type LegacyRow = {
  id: string;
  commentId: string;
  parentCommentId: string | null;
  walletAddress: string;
  text: string;
  signature: string;
  rootHash: string;
  mediaRootHash: string | null;
  mediaType: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};

function toLegacyComment(
  row: LegacyRow,
  reactions: CommentReactions = {
    counts: { ...EMPTY_COMMENT_REACTION_COUNTS },
    userReaction: null,
  }
): LegacyComment {
  return {
    id: row.id,
    commentId: row.commentId,
    parentCommentId: row.parentCommentId,
    walletAddress: row.walletAddress,
    text: row.text,
    signature: row.signature,
    rootHash: row.rootHash,
    mediaRootHash: row.mediaRootHash,
    mediaType: (row.mediaType as CommentMediaType | null) ?? null,
    mediaUrl: row.mediaRootHash
      ? commentMediaUrl(
          row.mediaRootHash,
          (row.mediaType as CommentMediaType | null) ?? null
        )
      : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
    reactions,
  };
}

export async function listLegacyComments(
  walletAddress?: string
): Promise<LegacyComment[]> {
  const rows = await prisma.legacyComment.findMany({
    orderBy: { createdAt: "desc" },
  });

  const reactionMap = await getCommentReactionsForComments(
    "legacy",
    rows.map((r) => r.commentId),
    walletAddress
  );

  return rows.map((row) => toLegacyComment(row, reactionMap[row.commentId]));
}

export async function getLegacyCommentByCommentId(
  commentId: string,
  walletAddress?: string
): Promise<LegacyComment | null> {
  const row = await prisma.legacyComment.findUnique({ where: { commentId } });
  if (!row) return null;
  const reactionMap = await getCommentReactionsForComments(
    "legacy",
    [commentId],
    walletAddress
  );
  return toLegacyComment(row, reactionMap[commentId]);
}

export async function createLegacyComment(data: {
  commentId: string;
  parentCommentId?: string | null;
  walletAddress: string;
  text: string;
  signature: string;
  rootHash: string;
  mediaRootHash?: string | null;
  mediaType?: string | null;
  createdAt: Date;
}): Promise<LegacyComment> {
  const row = await prisma.legacyComment.create({
    data: {
      commentId: data.commentId,
      parentCommentId: data.parentCommentId ?? null,
      walletAddress: data.walletAddress.toLowerCase(),
      text: data.text,
      signature: data.signature,
      rootHash: data.rootHash,
      mediaRootHash: data.mediaRootHash ?? null,
      mediaType: data.mediaType ?? null,
      createdAt: data.createdAt,
    },
  });
  return toLegacyComment(row);
}

export async function updateLegacyComment(data: {
  commentId: string;
  text: string;
  signature: string;
  rootHash: string;
  updatedAt: Date;
}): Promise<LegacyComment | null> {
  try {
    const row = await prisma.legacyComment.update({
      where: { commentId: data.commentId },
      data: {
        text: data.text,
        signature: data.signature,
        rootHash: data.rootHash,
        updatedAt: data.updatedAt,
      },
    });
    return toLegacyComment(row);
  } catch {
    return null;
  }
}

export async function deleteLegacyComment(commentId: string): Promise<boolean> {
  try {
    await prisma.legacyComment.delete({ where: { commentId } });
    return true;
  } catch {
    return false;
  }
}