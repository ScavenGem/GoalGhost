import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getMatchEmojiReactionSummaries,
  upsertMatchEmojiReaction,
} from "@/lib/cache/match-emoji-reactions-cache";
import {
  assertDatabaseConfigured,
  sanitizeDatabaseError,
} from "@/lib/db/config";
import { verifyMatchEmojiReactionSignature } from "@/lib/match-reactions/sign";
import { MATCH_EMOJI_REACTIONS } from "@/lib/match-reactions/types";
import type { MatchEmojiReactionId } from "@/lib/match-reactions/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

const reactionIds = MATCH_EMOJI_REACTIONS.map((r) => r.id) as [string, ...string[]];

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

const walletSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .transform((value) => value.toLowerCase());

const postSchema = z.object({
  matchId: z.string().min(1),
  walletAddress: walletSchema,
  tokenId: z.number().int().nonnegative(),
  reactionId: z.enum(reactionIds),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  createdAt: z.string().datetime({ offset: true }),
  rootHash: z.string().optional(),
});

function databaseErrorResponse(error: unknown, status = 503) {
  return NextResponse.json(
    { error: sanitizeDatabaseError(error) },
    { status, headers: NO_CACHE_HEADERS }
  );
}

export async function GET(req: Request) {
  try {
    assertDatabaseConfigured();

    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("matchIds") ?? "";
    const wallet = searchParams.get("wallet")?.toLowerCase() ?? undefined;
    const matchIds = raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const matches = await getMatchEmojiReactionSummaries(matchIds, wallet);

    return NextResponse.json(
      { matches, fetchedAt: new Date().toISOString() },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (e) {
    return databaseErrorResponse(e);
  }
}

export async function POST(req: Request) {
  try {
    assertDatabaseConfigured();

    const body = postSchema.parse(await req.json());

    const valid = await verifyMatchEmojiReactionSignature({
      address: body.walletAddress,
      tokenId: body.tokenId,
      matchId: body.matchId,
      reactionId: body.reactionId as MatchEmojiReactionId,
      createdAt: body.createdAt,
      signature: body.signature,
    });

    if (!valid) {
      return NextResponse.json(
        { error: "Invalid wallet signature" },
        { status: 401, headers: NO_CACHE_HEADERS }
      );
    }

    await upsertMatchEmojiReaction({
      matchId: body.matchId,
      walletAddress: body.walletAddress,
      reactionId: body.reactionId as MatchEmojiReactionId,
      signature: body.signature,
      rootHash: body.rootHash,
      createdAt: new Date(body.createdAt),
    });

    const matches = await getMatchEmojiReactionSummaries(
      [body.matchId],
      body.walletAddress
    );

    return NextResponse.json(
      {
        ok: true,
        summary: matches[body.matchId],
      },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid reaction payload" },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    return databaseErrorResponse(e);
  }
}