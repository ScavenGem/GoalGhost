import { NextResponse } from "next/server";
import { z } from "zod";
import { indexMemory, updateGhostStats } from "@/lib/cache/ghost-cache";
import { computeConfidenceDelta } from "@/lib/ghost/evolution";

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
  traitDelta: z
    .object({
      passion: z.number().optional(),
      loyalty: z.number().optional(),
      drama: z.number().optional(),
      hope: z.number().optional(),
      resilience: z.number().optional(),
    })
    .optional(),
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
      evolutionDelta: body.evolutionDelta,
      matchId: body.matchId,
      rootHash: body.rootHash,
      occurredAt: new Date(body.occurredAt),
    });

    if (
      body.evolutionDelta ||
      body.confidenceDelta ||
      body.mood ||
      body.traitDelta
    ) {
      await updateGhostStats(body.tokenId, {
        evolutionDelta: body.evolutionDelta,
        confidenceDelta:
          body.confidenceDelta ??
          computeConfidenceDelta(body.evolutionDelta ?? 0),
        mood: body.mood,
        traitDelta: body.traitDelta,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}