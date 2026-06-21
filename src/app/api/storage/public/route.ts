import { NextResponse } from "next/server";
import { downloadBlobFromStorage } from "@/lib/0g/storage/download";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const hash = searchParams.get("hash")?.trim();
    if (!hash) {
      return NextResponse.json({ error: "Missing hash" }, { status: 400 });
    }

    const blob = await downloadBlobFromStorage(hash);
    const buffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": blob.type || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load media";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}