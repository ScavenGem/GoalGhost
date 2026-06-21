import type { CommentMediaType } from "@/types/social-comment";

export const COMMENT_MEDIA_MAX_BYTES = 4 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, CommentMediaType> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "gif",
};

export function resolveCommentMediaType(file: File): CommentMediaType | null {
  return ALLOWED_TYPES[file.type] ?? null;
}

export function validateCommentMediaFile(file: File): string | null {
  const mediaType = resolveCommentMediaType(file);
  if (!mediaType) {
    return "Use a JPEG, PNG, WebP, or GIF image";
  }
  if (file.size > COMMENT_MEDIA_MAX_BYTES) {
    return "Image must be 4 MB or smaller";
  }
  return null;
}

export function commentMediaUrl(rootHash: string): string {
  return `/api/storage/public?hash=${encodeURIComponent(rootHash)}`;
}