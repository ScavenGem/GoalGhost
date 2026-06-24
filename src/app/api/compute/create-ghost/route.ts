import { NextResponse } from "next/server";
import { z } from "zod";
import { buildLabeledFallbackGhost } from "@/lib/0g/compute/create-fallback";
import {
  getComputeEnvStatus,
  getCreateComputeTimeoutMs,
} from "@/lib/0g/compute/env";
import { runGhostInference } from "@/lib/0g/compute/inference";
import { withTimeout } from "@/lib/0g/compute/timeout";
import type { GhostTraits } from "@/types/ghost";

export const dynamic = "force-dynamic";
/** Vercel Hobby caps at 10s; Pro can raise via OG_COMPUTE_CREATE_TIMEOUT_MS + platform limit. */
export const maxDuration = 10;

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

function formatComputeError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return `Invalid request: ${error.issues.map((i) => i.message).join("; ")}`;
  }
  if (error instanceof Error) return error.message;
  return "0G Compute failed";
}

export async function POST(req: Request) {
  let body: z.infer<typeof schema>;

  try {
    body = schema.parse(await req.json());
  } catch (e) {
    const msg = formatComputeError(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const env = getComputeEnvStatus();
  const attemptMs = getCreateComputeTimeoutMs();

  try {
    if (!env.ready) {
      throw new Error(env.issues.join(" "));
    }

    const { output, proof } = await withTimeout(
      runGhostInference<{
        name: string;
        backstory: string;
        voice: string;
        mood: string;
        traits: GhostTraits;
      }>({
        task: "create",
        team: body.team,
        traits: body.traits,
      }),
      attemptMs,
      "0G Compute ghost generation"
    );

    if (!output.name?.trim() || !output.backstory?.trim()) {
      throw new Error("0G Compute returned an incomplete ghost profile");
    }

    return NextResponse.json({
      source: "0g-compute",
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
      proof: { ...proof, fallback: false },
    });
  } catch (e) {
    const reason = formatComputeError(e);
    console.error("[create-ghost] Live 0G Compute unavailable:", reason, {
      envIssues: env.issues,
      attemptMs,
      rpcUrl: env.rpcUrl,
      providerOverride: env.providerOverride,
    });

    const fallback = buildLabeledFallbackGhost({
      team: body.team,
      teamCode: body.teamCode,
      traits: body.traits,
      reason,
    });

    return NextResponse.json({
      source: "labeled-fallback",
      fallbackReason: reason,
      ghost: fallback.ghost,
      proof: fallback.proof,
    });
  }
}