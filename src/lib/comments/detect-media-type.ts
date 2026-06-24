const SIGNATURES: { mime: string; bytes: number[]; offset?: number }[] = [
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/webp", bytes: [0x57, 0x45, 0x42, 0x50], offset: 8 },
];

/** Detect image MIME type from magic bytes. */
export function detectImageMimeType(bytes: Uint8Array): string | null {
  for (const { mime, bytes: sig, offset = 0 } of SIGNATURES) {
    if (bytes.length < offset + sig.length) continue;
    if (sig.every((value, index) => bytes[offset + index] === value)) {
      return mime;
    }
  }
  return null;
}

export function mimeTypeForCommentMedia(
  mediaType?: string | null
): string | null {
  if (mediaType === "gif") return "image/gif";
  if (mediaType === "image") return "image/jpeg";
  return null;
}