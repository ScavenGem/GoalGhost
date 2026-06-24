import { NextResponse } from "next/server";
import { getCachedCommentMedia } from "@/lib/cache/comment-media-cache";
import {
  detectImageMimeType,
  mimeTypeForCommentMedia,
} from "@/lib/comments/detect-media-type";
import { downloadBlobFromStorage } from "@/lib/0g/storage/download";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function resolveContentType(
  bytes: Uint8Array,
  hintedType?: string | null,
  blobType?: string
): string {
  if (blobType && blobType.startsWith("image/")) return blobType;
  return (
    mimeTypeForCommentMedia(hintedType) ||
    detectImageMimeType(bytes) ||
    "application/octet-stream"
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hash = searchParams.get("hash")?.trim();
    const hintedType = searchParams.get("type");

    if (!hash) {
      return NextResponse.json({ error: "Missing hash" }, { status: 400 });
    }

    const cached = await getCachedCommentMedia(hash);
    if (cached) {
      const bytes = new Uint8Array(cached.data);
      return new NextResponse(Buffer.from(bytes), {
        headers: {
          "Content-Type": resolveContentType(bytes, hintedType, cached.mimeType),
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    const blob = await downloadBlobFromStorage(hash);
    const bytes = new Uint8Array(await blob.arrayBuffer());

    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": resolveContentType(bytes, hintedType, blob.type),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load media";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}