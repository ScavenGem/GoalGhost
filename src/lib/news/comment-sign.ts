import { verifyMessage } from "viem";

export const NEWS_COMMENT_MAX_LENGTH = 1000;

export function buildNewsCommentMessage(params: {
  address: string;
  articleId: string;
  text: string;
  createdAt: string;
  parentCommentId?: string | null;
  mediaRootHash?: string | null;
}): string {
  return [
    "goalghost-news-comment:v2",
    params.address.toLowerCase(),
    params.articleId,
    params.parentCommentId ?? "",
    params.mediaRootHash ?? "",
    params.createdAt,
    params.text.trim(),
  ].join("\n");
}

function buildNewsCommentMessageV1(params: {
  address: string;
  articleId: string;
  text: string;
  createdAt: string;
}): string {
  return [
    "goalghost-news-comment:v1",
    params.address.toLowerCase(),
    params.articleId,
    params.createdAt,
    params.text.trim(),
  ].join("\n");
}

export async function verifyNewsCommentSignature(params: {
  address: string;
  articleId: string;
  text: string;
  createdAt: string;
  signature: string;
  parentCommentId?: string | null;
  mediaRootHash?: string | null;
}): Promise<boolean> {
  const address = params.address.toLowerCase() as `0x${string}`;
  const signature = params.signature as `0x${string}`;
  try {
    const v2 = await verifyMessage({
      address,
      message: buildNewsCommentMessage(params),
      signature,
    });
    if (v2) return true;
  } catch {
    /* fall through */
  }
  try {
    return await verifyMessage({
      address,
      message: buildNewsCommentMessageV1(params),
      signature,
    });
  } catch {
    return false;
  }
}

export function buildNewsCommentEditMessage(params: {
  address: string;
  commentId: string;
  articleId: string;
  text: string;
  updatedAt: string;
}): string {
  return [
    "goalghost-news-comment-edit:v1",
    params.address.toLowerCase(),
    params.commentId,
    params.articleId,
    params.updatedAt,
    params.text.trim(),
  ].join("\n");
}

export async function verifyNewsCommentEditSignature(params: {
  address: string;
  commentId: string;
  articleId: string;
  text: string;
  updatedAt: string;
  signature: string;
}): Promise<boolean> {
  try {
    return await verifyMessage({
      address: params.address.toLowerCase() as `0x${string}`,
      message: buildNewsCommentEditMessage(params),
      signature: params.signature as `0x${string}`,
    });
  } catch {
    return false;
  }
}

export function buildNewsCommentDeleteMessage(params: {
  address: string;
  commentId: string;
  articleId: string;
  deletedAt: string;
}): string {
  return [
    "goalghost-news-comment-delete:v1",
    params.address.toLowerCase(),
    params.commentId,
    params.articleId,
    params.deletedAt,
  ].join("\n");
}

export async function verifyNewsCommentDeleteSignature(params: {
  address: string;
  commentId: string;
  articleId: string;
  deletedAt: string;
  signature: string;
}): Promise<boolean> {
  try {
    return await verifyMessage({
      address: params.address.toLowerCase() as `0x${string}`,
      message: buildNewsCommentDeleteMessage(params),
      signature: params.signature as `0x${string}`,
    });
  } catch {
    return false;
  }
}