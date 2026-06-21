import { NextResponse } from "next/server";
import { z } from "zod";
import { runGhostInference } from "@/lib/0g/compute/inference";

const schema = z.object({
  ghost: z.object({
    name: z.string(),
    team: z.string(),
    evolutionScore: z.number(),
    mood: z.string(),
    recentMemories: z.array(z.string()),
  }),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const { output, proof } = await runGhostInference<{
      narrative: string;
      mood: string;
      evolutionInsight: string;
    }>({ task: "evolve", ghost: body.ghost });

    return NextResponse.json({ evolution: output, proof });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "0G Compute failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}