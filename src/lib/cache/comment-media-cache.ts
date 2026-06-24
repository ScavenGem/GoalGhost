import { prisma } from "@/lib/db/prisma";
import { detectImageMimeType } from "@/lib/comments/detect-media-type";

export async function cacheCommentMedia(data: {
  rootHash: string;
  bytes: Uint8Array;
  mimeType?: string | null;
}): Promise<void> {
  const mimeType =
    data.mimeType?.trim() ||
    detectImageMimeType(data.bytes) ||
    "application/octet-stream";

  await prisma.commentMediaCache.upsert({
    where: { rootHash: data.rootHash },
    create: {
      rootHash: data.rootHash,
      mimeType,
      data: Buffer.from(data.bytes),
    },
    update: {
      mimeType,
      data: Buffer.from(data.bytes),
    },
  });
}

export async function getCachedCommentMedia(rootHash: string): Promise<{
  mimeType: string;
  data: Buffer;
} | null> {
  const row = await prisma.commentMediaCache.findUnique({
    where: { rootHash },
  });
  if (!row) return null;
  return { mimeType: row.mimeType, data: Buffer.from(row.data) };
}