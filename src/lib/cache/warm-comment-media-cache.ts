import { cacheCommentMedia } from "@/lib/cache/comment-media-cache";
import {
  detectImageMimeType,
  mimeTypeForCommentMedia,
} from "@/lib/comments/detect-media-type";
import { downloadBlobFromStorage } from "@/lib/0g/storage/download";

/** Best-effort cache of attachment bytes so /api/storage/public can serve immediately. */
export async function warmCommentMediaCache(data: {
  mediaRootHash?: string | null;
  mediaType?: string | null;
}): Promise<void> {
  if (!data.mediaRootHash) return;

  try {
    const blob = await downloadBlobFromStorage(data.mediaRootHash);
    const bytes = new Uint8Array(await blob.arrayBuffer());
    await cacheCommentMedia({
      rootHash: data.mediaRootHash,
      bytes,
      mimeType:
        detectImageMimeType(bytes) ||
        mimeTypeForCommentMedia(data.mediaType) ||
        blob.type ||
        null,
    });
  } catch {
    // 0G propagation can lag; the public route retries download directly.
  }
}