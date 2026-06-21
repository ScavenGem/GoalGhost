import { verifyMessage } from "viem";

export const LEGACY_COMMENT_MAX_LENGTH = 500;

export function shortenWalletAddress(address: string): string {
  const normalized = address.trim();
  if (normalized.length < 10) return normalized;
  return `${normalized.slice(0, 6)}...${normalized.slice(-4)}`;
}

export function buildLegacyCommentMessage(params: {
  address: string;
  text: string;
  createdAt: string;
  parentCommentId?: string | null;
  mediaRootHash?: string | null;
}): string {
  return [
    "goalghost-legacy-comment:v2",
    params.address.toLowerCase(),
    params.parentCommentId ?? "",
    params.mediaRootHash ?? "",
    params.createdAt,
    params.text.trim(),
  ].join("\n");
}

function buildLegacyCommentMessageV1(params: {
  address: string;
  text: string;
  createdAt: string;
}): string {
  return [
    "goalghost-legacy-comment:v1",
    params.address.toLowerCase(),
    params.createdAt,
    params.text.trim(),
  ].join("\n");
}

export async function verifyLegacyCommentSignature(params: {
  address: string;
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
      message: buildLegacyCommentMessage(params),
      signature,
    });
    if (v2) return true;
  } catch {
    /* fall through */
  }
  try {
    return await verifyMessage({
      address,
      message: buildLegacyCommentMessageV1(params),
      signature,
    });
  } catch {
    return false;
  }
}

export function buildLegacyCommentEditMessage(params: {
  address: string;
  commentId: string;
  text: string;
  updatedAt: string;
}): string {
  return [
    "goalghost-legacy-comment-edit:v1",
    params.address.toLowerCase(),
    params.commentId,
    params.updatedAt,
    params.text.trim(),
  ].join("\n");
}

export async function verifyLegacyCommentEditSignature(params: {
  address: string;
  commentId: string;
  text: string;
  updatedAt: string;
  signature: string;
}): Promise<boolean> {
  try {
    return await verifyMessage({
      address: params.address.toLowerCase() as `0x${string}`,
      message: buildLegacyCommentEditMessage(params),
      signature: params.signature as `0x${string}`,
    });
  } catch {
    return false;
  }
}

export function buildLegacyCommentDeleteMessage(params: {
  address: string;
  commentId: string;
  deletedAt: string;
}): string {
  return [
    "goalghost-legacy-comment-delete:v1",
    params.address.toLowerCase(),
    params.commentId,
    params.deletedAt,
  ].join("\n");
}

export async function verifyLegacyCommentDeleteSignature(params: {
  address: string;
  commentId: string;
  deletedAt: string;
  signature: string;
}): Promise<boolean> {
  try {
    return await verifyMessage({
      address: params.address.toLowerCase() as `0x${string}`,
      message: buildLegacyCommentDeleteMessage(params),
      signature: params.signature as `0x${string}`,
    });
  } catch {
    return false;
  }
}