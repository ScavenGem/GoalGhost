"use client";

import { uploadPublicBytesFromBrowser } from "@/lib/0g/storage/upload-public-browser";
import { getStorageSdk } from "@/lib/0g/storage/browser-signer";
import { resolveCommentMediaType, validateCommentMediaFile } from "@/lib/comments/media";
import type { CommentMediaType } from "@/types/social-comment";

export type PreparedCommentMedia = {
  mediaRootHash: string;
  mediaType: CommentMediaType;
  bytes: Uint8Array;
};

async function computePublicBytesRootHash(bytes: Uint8Array): Promise<string> {
  const { MemData } = await getStorageSdk();
  const mem = new MemData(bytes);
  const [tree, treeErr] = await mem.merkleTree();
  if (treeErr) throw new Error(`Merkle error: ${treeErr}`);

  const rootHash = tree?.rootHash();
  if (!rootHash) throw new Error("No root hash");
  return rootHash;
}

/** Local hash only — no wallet/network. Use before personal_sign. */
export async function prepareCommentMediaForSigning(
  file: File
): Promise<PreparedCommentMedia> {
  const validationError = validateCommentMediaFile(file);
  if (validationError) throw new Error(validationError);

  const mediaType = resolveCommentMediaType(file);
  if (!mediaType) throw new Error("Unsupported media type");

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mediaRootHash = await computePublicBytesRootHash(bytes);
  return { mediaRootHash, mediaType, bytes };
}

export async function uploadPreparedCommentMedia(
  prepared: PreparedCommentMedia
): Promise<void> {
  const { rootHash } = await uploadPublicBytesFromBrowser(prepared.bytes);
  if (rootHash !== prepared.mediaRootHash) {
    throw new Error("Media upload hash mismatch");
  }
}

/** Encode prepared media for server-side 0G upload in the news comments API. */
export function encodePreparedCommentMediaBase64(
  prepared: PreparedCommentMedia
): string {
  let binary = "";
  for (let i = 0; i < prepared.bytes.length; i++) {
    binary += String.fromCharCode(prepared.bytes[i]!);
  }
  return btoa(binary);
}

export async function uploadCommentMedia(file: File): Promise<{
  mediaRootHash: string;
  mediaType: CommentMediaType;
}> {
  const prepared = await prepareCommentMediaForSigning(file);
  await uploadPreparedCommentMedia(prepared);
  return {
    mediaRootHash: prepared.mediaRootHash,
    mediaType: prepared.mediaType,
  };
}