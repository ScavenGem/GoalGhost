import { prisma } from "@/lib/db/prisma";
import { getCommentReactionsForComments } from "@/lib/cache/comment-reactions-cache";
import type { NewsComment } from "@/types/news-comment";
import {
  EMPTY_COMMENT_REACTION_COUNTS,
  type CommentMediaType,
  type CommentReactions,
} from "@/types/social-comment";

type NewsRow = {
  id: string;
  commentId: string;
  articleId: string;
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

function toNewsComment(
  row: NewsRow,
  reactions: CommentReactions = {
    counts: { ...EMPTY_COMMENT_REACTION_COUNTS },
    userReaction: null,
  }
): NewsComment {
  return {
    id: row.id,
    commentId: row.commentId,
    articleId: row.articleId,
    parentCommentId: row.parentCommentId,
    walletAddress: row.walletAddress,
    text: row.text,
    signature: row.signature,
    rootHash: row.rootHash,
    mediaRootHash: row.mediaRootHash,
    mediaType: (row.mediaType as CommentMediaType | null) ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt?.toISOString() ?? null,
    reactions,
  };
}

export async function listNewsComments(
  articleIds: string[],
  walletAddress?: string
): Promise<NewsComment[]> {
  if (articleIds.length === 0) return [];

  const rows = await prisma.newsComment.findMany({
    where: { articleId: { in: articleIds } },
    orderBy: { createdAt: "desc" },
  });

  const reactionMap = await getCommentReactionsForComments(
    "news",
    rows.map((r) => r.commentId),
    walletAddress
  );

  return rows.map((row) => toNewsComment(row, reactionMap[row.commentId]));
}

export async function getNewsCommentByCommentId(
  commentId: string,
  walletAddress?: string
): Promise<NewsComment | null> {
  const row = await prisma.newsComment.findUnique({ where: { commentId } });
  if (!row) return null;
  const reactionMap = await getCommentReactionsForComments(
    "news",
    [commentId],
    walletAddress
  );
  return toNewsComment(row, reactionMap[commentId]);
}

export async function createNewsComment(data: {
  commentId: string;
  articleId: string;
  parentCommentId?: string | null;
  walletAddress: string;
  text: string;
  signature: string;
  rootHash: string;
  mediaRootHash?: string | null;
  mediaType?: string | null;
  createdAt: Date;
}) {
  const row = await prisma.newsComment.create({
    data: {
      commentId: data.commentId,
      articleId: data.articleId,
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
  return toNewsComment(row);
}

export async function updateNewsComment(data: {
  commentId: string;
  text: string;
  signature: string;
  rootHash: string;
  updatedAt: Date;
}): Promise<NewsComment | null> {
  try {
    const row = await prisma.newsComment.update({
      where: { commentId: data.commentId },
      data: {
        text: data.text,
        signature: data.signature,
        rootHash: data.rootHash,
        updatedAt: data.updatedAt,
      },
    });
    return toNewsComment(row);
  } catch {
    return null;
  }
}

export async function deleteNewsComment(commentId: string): Promise<boolean> {
  try {
    await prisma.newsComment.delete({ where: { commentId } });
    return true;
  } catch {
    return false;
  }
}