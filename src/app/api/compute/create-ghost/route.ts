import { NextResponse } from "next/server";
import { z } from "zod";
import { buildLabeledFallbackGhost } from "@/lib/0g/compute/create-fallback";
import {
  getComputeEnvStatus,
  getCreateComputeTimeoutMs,
  isLiveComputeEnabled,
} from "@/lib/0g/compute/env";
import type { GhostTraits } from "@/types/ghost";
import { analyzeWalletIdentity } from "@/lib/ghost/identity-distinctness";

export const dynamic = "force-dynamic";
/** Vercel Hobby caps at 10s; Pro can raise via OG_COMPUTE_CREATE_TIMEOUT_MS + platform limit. */
export const maxDuration = 10;

const schema = z.object({
  team: z.string(),
  teamCode: z.string(),
  walletAddress: z.string().optional(),
  traits: z.object({
    passion: z.number(),
    loyalty: z.number(),
    drama: z.number(),
    hope: z.number(),
    resilience: z.number(),
  }),
});

type CreateGhostBody = z.infer<typeof schema>;

function formatComputeError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return `Invalid request: ${error.issues.map((i) => i.message).join("; ")}`;
  }
  if (error instanceof Error) return error.message;
  return "0G Compute failed";
}

function labeledFallbackResponse(
  body: CreateGhostBody,
  reason: string,
  meta?: Record<string, unknown>
) {
  console.error("[create-ghost] Returning labeled fallback:", reason, meta);

  const identity = analyzeWalletIdentity({
    walletAddress: body.walletAddress,
    traits: body.traits,
  });

  const fallback = buildLabeledFallbackGhost({
    team: body.team,
    teamCode: body.teamCode,
    traits: body.traits,
    walletAddress: body.walletAddress,
    identity,
    reason,
  });

  return NextResponse.json(
    {
      source: "labeled-fallback",
      fallbackReason: reason,
      ghost: fallback.ghost,
      proof: fallback.proof,
    },
    { status: 200 }
  );
}

async function tryLiveCompute(body: CreateGhostBody) {
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

  const identity = analyzeWalletIdentity({
    walletAddress: body.walletAddress,
    traits: body.traits,
  });

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
      walletAddress: body.walletAddress,
      identity,
    }),
    attemptMs,
    "0G Compute ghost generation"
  );

  if (!output.name?.trim() || !output.backstory?.trim()) {
    throw new Error("0G Compute returned an incomplete ghost profile");
  }

  console.info("[create-ghost] Live 0G Compute succeeded", {
    team: body.team,
    attemptMs,
    provider: proof.provider,
  });

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
}

export async function POST(req: Request) {
  let body: CreateGhostBody;

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