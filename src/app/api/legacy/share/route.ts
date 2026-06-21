import { NextResponse } from "next/server";
import { downloadJsonFromStorage } from "@/lib/0g/storage/download";
import { getGhostByTokenId, getLegacyRootHash } from "@/lib/cache/ghost-cache";
import type { LegacyDocument } from "@/types/legacy";

const PUBLIC_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, stale-while-revalidate=120",
};

function isLegacyDocument(value: unknown): value is LegacyDocument {
  if (!value || typeof value !== "object") return false;
  const doc = value as Record<string, unknown>;
  return (
    doc.version === 1 &&
    typeof doc.tokenId === "number" &&
    typeof doc.story === "string" &&
    typeof doc.shareText === "string" &&
    Array.isArray(doc.highlights) &&
    typeof doc.generatedAt === "string"
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenId = Number.parseInt(searchParams.get("tokenId") ?? "", 10);
    if (!Number.isFinite(tokenId) || tokenId < 0) {
      return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
    }

    const ghost = await getGhostByTokenId(tokenId);
    if (!ghost) {
      return NextResponse.json({ error: "Legacy not found" }, { status: 404 });
    }

    const rootHash = await getLegacyRootHash(tokenId);
    if (!rootHash) {
      return NextResponse.json({ error: "Legacy not published yet" }, { status: 404 });
    }

    const ghostPayload = {
      name: ghost.name,
      team: ghost.team,
      evolutionScore: ghost.evolutionScore,
      confidence: ghost.confidence,
      mood: ghost.mood,
      tokenId: ghost.tokenId,
    };

    let legacy: LegacyDocument;
    try {
      const raw = await downloadJsonFromStorage(rootHash);
      if (!isLegacyDocument(raw)) {
        return NextResponse.json(
          { error: "Legacy document invalid or unavailable" },
          { status: 404 }
        );
      }
      legacy = raw;
    } catch {
      return NextResponse.json(
        { error: "Legacy document unavailable from 0G Storage" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        ghost: ghostPayload,
        legacy,
        rootHash,
        fetchedAt: new Date().toISOString(),
      },
      { headers: PUBLIC_CACHE_HEADERS }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load shared legacy";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}