import { NextResponse } from "next/server";
import { z } from "zod";
import { runGhostInference } from "@/lib/0g/compute/inference";
import type { FootballMatch, MatchStatus } from "@/types/match";

const schema = z.object({
  ghost: z.object({
    name: z.string(),
    team: z.string(),
    mood: z.string(),
    evolutionScore: z.number(),
  }),
  match: z.object({
    id: z.string(),
    homeTeam: z.string(),
    awayTeam: z.string(),
    homeTeamCode: z.string(),
    awayTeamCode: z.string(),
    status: z.string(),
    utcDate: z.string(),
    score: z.object({ home: z.number(), away: z.number() }).optional(),
    minute: z.number().optional(),
    competition: z.string(),
  }),
  eventType: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const { output, proof } = await runGhostInference<{
      reaction: string;
      emotionalTone: string;
      evolutionDelta: number;
      title: string;
    }>({
      task: "reaction",
      ghost: body.ghost,
      match: { ...body.match, status: body.match.status as MatchStatus } as FootballMatch,
      eventType: body.eventType,
    });

    return NextResponse.json({ reaction: output, proof });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "0G Compute failed";
    return NextResponse.json({ error: msg }, { status: 503 });
  }
}