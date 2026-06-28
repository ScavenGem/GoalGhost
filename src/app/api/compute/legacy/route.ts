import { NextResponse } from "next/server";
import { z } from "zod";
import { buildLabeledFallbackLegacy } from "@/lib/0g/compute/legacy-fallback";
import {
  getComputeEnvStatus,
  getCreateComputeTimeoutMs,
  isLiveComputeEnabled,
} from "@/lib/0g/compute/env";
import type { MemoryEvent } from "@/types/memory";
import { walletIdentitySchema } from "@/lib/ghost/identity-schema";
import { buildLegacyJourneyContext } from "@/lib/legacy/build-legacy-journey-context";
import type { GhostMemory } from "@/lib/legacy/build-legacy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const schema = z.object({
  ghost: z.object({
    name: z.string(),
    team: z.string(),
    evolutionScore: z.number(),
    tokenId: z.number(),
    mood: z.string().optional(),
    confidence: z.number().optional(),
  }),
  memories: z.array(z.record(z.unknown())),
  identity: walletIdentitySchema.optional(),
});

type LegacyBody = z.infer<typeof schema>;

function formatComputeError(error: unknown): string {
  if (error instanceof z.ZodError) {
    return `Invalid request: ${error.issues.map((i) => i.message).join("; ")}`;
  }
  if (error instanceof Error) return error.message;
  return "0G Compute failed";
}

function toGhostMemories(body: LegacyBody): GhostMemory[] {
  return body.memories as GhostMemory[];
}

function buildJourney(body: LegacyBody) {
  return buildLegacyJourneyContext({
    memories: toGhostMemories(body),
    identity: body.identity,
    ghost: body.ghost,
  });
}

function labeledFallbackResponse(
  body: LegacyBody,
  reason: string,
  meta?: Record<string, unknown>
) {
  console.error("[legacy] Returning labeled fallback:", reason, meta);

  const journey = buildJourney(body);

  const fallback = buildLabeledFallbackLegacy({
    ghost: body.ghost,
    memories: toGhostMemories(body),
    identity: body.identity,
    journey,
    reason,
  });

  return NextResponse.json(
    {
      source: "labeled-fallback",
      fallbackReason: reason,
      legacy: fallback.legacy,
      proof: fallback.proof,
    },
    { status: 200 }
  );
}

async function tryLiveCompute(body: LegacyBody) {
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

  const journey = buildJourney(body);

  const { output, proof } = await withTimeout(
    runGhostInference<{
      story: string;
      highlights: string[];
      transformation: { from: string; to: string; arc: string };
      shareText: string;
      dominantMood: string;
      emotionalArc?: string;
      banterChapter?: { title: string; body: string };
      interactionQuotes?: { quote: string; context: string }[];
      wrappedStats?: { label: string; value: string; insight: string }[];
      celebration: { title: string; body: string };
      heartbreak: { title: string; body: string };
      rivalry: { title: string; body: string };
      fanIdentity: { title: string; body: string };
    }>({
      task: "legacy",
      ghost: body.ghost,
      memories: body.memories as MemoryEvent[],
      identity: body.identity,
      journey,
    }),
    attemptMs,
    "0G Compute legacy generation"
  );

  if (!output.story?.trim()) {
    throw new Error("0G Compute returned an incomplete legacy story");
  }

  console.info("[legacy] Live 0G Compute succeeded", {
    ghost: body.ghost.name,
    attemptMs,
    provider: proof.provider,
    signedComments: journey.stats.signedComments,
    keyMoments: journey.keyMoments.length,
  });

  return NextResponse.json({
    source: "0g-compute",
    legacy: output,
    proof,
  });
}

export async function POST(req: Request) {
  let body: LegacyBody;

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