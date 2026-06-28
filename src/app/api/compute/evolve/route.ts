import { NextResponse } from "next/server";
import { z } from "zod";
import { buildLabeledFallbackEvolution } from "@/lib/0g/compute/evolve-fallback";
import { walletIdentitySchema } from "@/lib/ghost/identity-schema";
import {
  getComputeEnvStatus,
  getCreateComputeTimeoutMs,
  isLiveComputeEnabled,
} from "@/lib/0g/compute/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  ghost: z.object({
    name: z.string(),
    team: z.string(),
    evolutionScore: z.number(),
    mood: z.string(),
    confidence: z.number().optional(),
    traits: z
      .object({
        passion: z.number(),
        loyalty: z.number(),
        drama: z.number(),
        hope: z.number(),
        resilience: z.number(),
      })
      .optional(),
    recentMemories: z.array(z.string()),
    interactionCount: z.number().optional(),
    identity: walletIdentitySchema.optional(),
  }),
});

type EvolveBody = z.infer<typeof schema>;

function formatComputeError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return `Invalid request: ${error.issues.map((i) => i.message).join("; ")}`;
  }
  if (error instanceof Error) return error.message;
  return "0G Compute failed";
}

function labeledFallbackResponse(
  body: EvolveBody,
  reason: string,
  meta?: Record<string, unknown>
) {
  console.error("[evolve] Returning labeled fallback:", reason, meta);

  const fallback = buildLabeledFallbackEvolution({
    ghost: body.ghost,
    reason,
  });

  return NextResponse.json(
    {
      source: "labeled-fallback",
      fallbackReason: reason,
      evolution: fallback.evolution,
      proof: fallback.proof,
    },
    { status: 200 }
  );
}

async function tryLiveCompute(body: EvolveBody) {
  const env = getComputeEnvStatus();
  const attemptMs = getCreateComputeTimeoutMs();
  const computeMode = process.env.OG_COMPUTE_MODE?.trim() ?? "unset";

  if (!isLiveComputeEnabled()) {
    throw new Error(
      `OG_COMPUTE_MODE is not "live" (current: ${computeMode}) — skipping live 0G Compute`
    );
  }

  if (!env.ready) {
    throw new Error(env.issues.join(" "));
  }

  const [{ runGhostInference }, { withTimeout }] = await Promise.all([
    import("@/lib/0g/compute/inference"),
    import("@/lib/0g/compute/timeout"),
  ]);

  const { output, proof } = await withTimeout(
    runGhostInference<{
      narrative: string;
      mood: string;
      evolutionInsight: string;
    }>({
      task: "evolve",
      ghost: body.ghost,
    }),
    attemptMs,
    "0G Compute evolution narrative"
  );

  if (!output.narrative?.trim()) {
    throw new Error("0G Compute returned an incomplete evolution narrative");
  }

  console.info("[evolve] Live 0G Compute succeeded", {
    ghost: body.ghost.name,
    attemptMs,
    provider: proof.provider,
  });

  return NextResponse.json({
    source: "0g-compute",
    evolution: output,
    proof,
  });
}

export async function POST(req: Request) {
  let body: EvolveBody;

  try {
    body = schema.parse(await req.json());
  } catch (e) {
    const msg = formatComputeError(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const env = getComputeEnvStatus();
  const attemptMs = getCreateComputeTimeoutMs();

  try {
    return await tryLiveCompute(body);
  } catch (e) {
    const reason = formatComputeError(e);
    return labeledFallbackResponse(body, reason, {
      envIssues: env.issues,
      attemptMs,
      rpcUrl: env.rpcUrl,
      providerOverride: env.providerOverride,
      computeMode: process.env.OG_COMPUTE_MODE?.trim() ?? "unset",
      liveEnabled: isLiveComputeEnabled(),
    });
  }
}