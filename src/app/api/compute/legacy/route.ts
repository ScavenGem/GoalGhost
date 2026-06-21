import { NextResponse } from "next/server";
import { z } from "zod";
import { runGhostInference } from "@/lib/0g/compute/inference";
import type { MemoryEvent } from "@/types/memory";

const schema = z.object({
  ghost: z.object({
    name: z.string(),
    team: z.string(),
    evolutionScore: z.number(),
    tokenId: z.number(),
  }),
  memories: z.array(z.record(z.unknown())),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const { output, proof } = await runGhostInference<{
      story: string;
      highlights: string[];
      transformation: { from: string; to: string; arc: string };
      shareText: string;
      dominantMood: string;
      celebration: { title: string; body: string };
      heartbreak: { title: string; body: string };
      rivalry: { title: string; body: string };
      fanIdentity: { title: string; body: string };
    }>({
      task: "legacy",
      ghost: body.ghost,
      memories: body.memories as MemoryEvent[],
    });

    return NextResponse.json({ legacy: output, proof });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "0G Compute failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}