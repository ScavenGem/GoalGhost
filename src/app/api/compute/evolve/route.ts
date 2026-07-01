import { NextResponse } from "next/server";
import { z } from "zod";
import { buildLabeledFallbackEvolution } from "@/lib/0g/compute/evolve-fallback";
import { verifyEvolveNarrativeSignature } from "@/lib/ghost/evolve-sign";
import { walletIdentitySchema } from "@/lib/ghost/identity-schema";
import {
  getComputeEnvStatus,
  getCreateComputeTimeoutMs,
  isLiveComputeEnabled,
} from "@/lib/0g/compute/env";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const traitsSchema = z.object({
  passion: z.number(),
  loyalty: z.number(),
  drama: z.number(),
  hope: z.number(),
  resilience: z.number(),
});

const ghostSchema = z.object({
  name: z.string(),
  team: z.string(),
  evolutionScore: z.number(),
  mood: z.string(),
  confidence: z.number().optional(),
  traits: traitsSchema.nullish(),
  recentMemories: z.array(z.string()),
  interactionCount: z.number().optional(),
  identity: walletIdentitySchema.nullish(),
});

const schema = z.object({
  walletAddress: z.string(),
  tokenId: z.number(),
  signature: z.string(),
  signedAt: z.string(),
  ghost: ghostSchema,
});

function sanitizeEvolveBody(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const body = { ...(raw as Record<string, unknown>) };
  if (body.ghost && typeof body.ghost === "object" && body.ghost !== null) {
    const ghost = { ...(body.ghost as Record<string, unknown>) };
    if (ghost.traits === null) delete ghost.traits;
    if (ghost.identity === null) delete ghost.identity;
    body.ghost = ghost;
  }
  return body;
}

type EvolveBody = z.infer<typeof schema>;

type EvolveGhostInput = {
  name: string;
  team: string;
  evolutionScore: number;
  mood: string;
  confidence?: number;
  traits?: z.infer<typeof traitsSchema>;
  recentMemories: string[];
  interactionCount?: number;
  identity?: z.infer<typeof walletIdentitySchema>;
};

function normalizeEvolveGhost(ghost: EvolveBody["ghost"]): EvolveGhostInput {
  const normalized: EvolveGhostInput = {
    name: ghost.name,
    team: ghost.team,
    evolutionScore: ghost.evolutionScore,
    mood: ghost.mood,
    recentMemories: ghost.recentMemories,
  };

  if (ghost.confidence != null) normalized.confidence = ghost.confidence;
  if (ghost.traits) normalized.traits = ghost.traits;
  if (ghost.interactionCount != null) {
    normalized.interactionCount = ghost.interactionCount;
  }
  if (ghost.identity) normalized.identity = ghost.identity;

  return normalized;
}

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
    ghost: normalizeEvolveGhost(body.ghost),
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
      ghost: normalizeEvolveGhost(body.ghost),
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
    body = schema.parse(sanitizeEvolveBody(await req.json()));
  } catch (e) {
    const msg = formatComputeError(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const signatureValid = await verifyEvolveNarrativeSignature({
    address: body.walletAddress,
    tokenId: body.tokenId,
    signedAt: body.signedAt,
    signature: body.signature,
  });

  if (!signatureValid) {
    return NextResponse.json(
      { error: "Invalid wallet signature for narrative evolution" },
      { status: 401 }
    );
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