"use client";

import { uploadPublicBytesFromBrowser } from "@/lib/0g/storage/upload-public-browser";
import { resolveCommentMediaType, validateCommentMediaFile } from "@/lib/comments/media";
import type { CommentMediaType } from "@/types/social-comment";

export async function uploadCommentMedia(file: File): Promise<{
  mediaRootHash: string;
  mediaType: CommentMediaType;
}> {
  const validationError = validateCommentMediaFile(file);
  if (validationError) throw new Error(validationError);

  const mediaType = resolveCommentMediaType(file);
  if (!mediaType) throw new Error("Unsupported media type");

  const buffer = await file.arrayBuffer();
  const { rootHash } = await uploadPublicBytesFromBrowser(new Uint8Array(buffer));
  return { mediaRootHash: rootHash, mediaType };
}