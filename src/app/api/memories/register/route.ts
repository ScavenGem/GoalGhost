import { NextResponse } from "next/server";
import { z } from "zod";
import { indexMemory, updateGhostStats } from "@/lib/cache/ghost-cache";

const schema = z.object({
  tokenId: z.number(),
  eventId: z.string(),
  type: z.string(),
  title: z.string().optional(),
  content: z.string().optional(),
  emotionalTone: z.string().optional(),
  matchId: z.string().optional(),
  rootHash: z.string(),
  occurredAt: z.string(),
  evolutionDelta: z.number().optional(),
  confidenceDelta: z.number().optional(),
  mood: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    await indexMemory({
      tokenId: body.tokenId,
      eventId: body.eventId,
      type: body.type,
      title: body.title,
      content: body.content,
      emotionalTone: body.emotionalTone,
      matchId: body.matchId,
      rootHash: body.rootHash,
      occurredAt: new Date(body.occurredAt),
    });

    if (body.evolutionDelta || body.confidenceDelta || body.mood) {
      await updateGhostStats(body.tokenId, {
        evolutionDelta: body.evolutionDelta,
        confidenceDelta: body.confidenceDelta ?? Math.round((body.evolutionDelta ?? 0) / 2),
        mood: body.mood,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}