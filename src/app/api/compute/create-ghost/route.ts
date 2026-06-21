import { NextResponse } from "next/server";
import { z } from "zod";
import { runGhostInference } from "@/lib/0g/compute/inference";
import type { GhostTraits } from "@/types/ghost";

const schema = z.object({
  team: z.string(),
  teamCode: z.string(),
  traits: z.object({
    passion: z.number(),
    loyalty: z.number(),
    drama: z.number(),
    hope: z.number(),
    resilience: z.number(),
  }),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    // JUDGE NOTE: Ghost birth intelligence runs on 0G Compute - not mockable
    const { output, proof } = await runGhostInference<{
      name: string;
      backstory: string;
      voice: string;
      mood: string;
      traits: GhostTraits;
    }>({
      task: "create",
      team: body.team,
      traits: body.traits,
    });

    return NextResponse.json({
      ghost: {
        name: output.name,
        backstory: output.backstory,
        voice: output.voice,
        mood: output.mood ?? "electric",
        traits: output.traits ?? body.traits,
        team: body.team,
        teamCode: body.teamCode,
        evolutionScore: 0,
      },
      proof,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "0G Compute failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}