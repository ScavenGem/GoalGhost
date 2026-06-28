"use client";

import {
  fetchWithTimeout,
  readApiErrorMessage,
} from "@/lib/api/client-fetch";
import { ensureComputeSubAccountIfNeeded } from "@/lib/0g/compute/ensure-legacy-sub-account";
import type { LegacyInitPhase } from "@/lib/0g/compute/ensure-legacy-sub-account";
import { sealEciesJsonFromWallet } from "@/lib/0g/storage/seal-ecies-client";
import type { GhostApiRecord } from "@/hooks/use-ghost";
import type { OgComputeProof } from "@/types/ghost";
import { gatherEvolveContext } from "@/lib/ghost/evolve-context";
import {
  computeConfidenceDelta,
  computeEvolveNarrativeDelta,
  evolveTraitDeltaFromContext,
} from "@/lib/ghost/evolution";

const EVOLVE_API_TIMEOUT_MS = 60_000;

export type EvolveNarrativePhase = LegacyInitPhase | "sealing";

export type EvolveNarrativeResult = {
  eventId: string;
  narrative: string;
  mood: string;
  evolutionInsight: string;
  evolutionDelta: number;
  rootHash: string;
  source: string;
  proof?: OgComputeProof;
};

export async function runEvolveNarrative(params: {
  walletAddress: string;
  ghost: GhostApiRecord;
  onPhase?: (phase: EvolveNarrativePhase | null) => void;
}): Promise<EvolveNarrativeResult> {
  const { walletAddress, ghost, onPhase } = params;

  await ensureComputeSubAccountIfNeeded(onPhase);
  onPhase?.("generating");

  const { memoryLines, identity } = await gatherEvolveContext(
    walletAddress,
    ghost
  );
  const evolutionDelta = computeEvolveNarrativeDelta(memoryLines.length);
  const traitDelta = evolveTraitDeltaFromContext(memoryLines.length);

  const res = await fetchWithTimeout("/api/compute/evolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ghost: {
        name: ghost.name,
        team: ghost.team,
        evolutionScore: ghost.evolutionScore,
        mood: ghost.mood,
        confidence: ghost.confidence,
        traits: ghost.traits,
        recentMemories: memoryLines,
        interactionCount: memoryLines.length,
        identity,
      },
    }),
    timeoutMs: EVOLVE_API_TIMEOUT_MS,
  });

  const data = (await res.json()) as {
    evolution?: {
      narrative?: string;
      mood?: string;
      evolutionInsight?: string;
    };
    proof?: OgComputeProof;
    source?: string;
    error?: string;
  };

  if (!res.ok || !data.evolution?.narrative?.trim()) {
    throw new Error(
      data.error ?? (await readApiErrorMessage(res, "0G Compute evolve failed"))
    );
  }

  const narrative = data.evolution.narrative.trim();
  const mood = data.evolution.mood?.trim() || ghost.mood;
  const evolutionInsight =
    data.evolution.evolutionInsight?.trim() ||
    "Your fan identity voice is sharpening with every signed comment, reaction, and match felt.";

  onPhase?.("sealing");

  const eventId = `evolve-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const confidenceDelta = computeConfidenceDelta(evolutionDelta);

  const memory = {
    version: 1 as const,
    id: eventId,
    tokenId: ghost.tokenId,
    type: "evolution_checkpoint" as const,
    title: "Narrative Evolution",
    content: narrative,
    emotionalTone: mood,
    evolutionDelta,
    timestamp,
    computeProof: data.proof,
    metadata: { evolutionInsight, source: data.source ?? "unknown" },
  };

  const { rootHash } = await sealEciesJsonFromWallet(memory);

  const registerRes = await fetch("/api/memories/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tokenId: ghost.tokenId,
      eventId,
      type: "evolution_checkpoint",
      rootHash,
      occurredAt: timestamp,
      title: memory.title,
      content: narrative,
      emotionalTone: mood,
      evolutionDelta,
      confidenceDelta,
      mood,
      traitDelta,
    }),
  });

  if (!registerRes.ok) {
    const regData = (await registerRes.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(regData.error ?? "Failed to index evolution on ghost cache");
  }

  return {
    eventId,
    narrative,
    mood,
    evolutionInsight,
    evolutionDelta,
    rootHash,
    source: data.source ?? "unknown",
    proof: data.proof,
  };
}