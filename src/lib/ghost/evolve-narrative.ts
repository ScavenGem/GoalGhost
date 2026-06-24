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

const EVOLVE_API_TIMEOUT_MS = 60_000;
const EVOLUTION_DELTA = 4;

export type EvolveNarrativePhase = LegacyInitPhase | "sealing";

export type EvolveNarrativeResult = {
  eventId: string;
  narrative: string;
  mood: string;
  evolutionInsight: string;
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

  const recentMemories = await gatherEvolveContext(walletAddress, ghost);

  const res = await fetchWithTimeout("/api/compute/evolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ghost: {
        name: ghost.name,
        team: ghost.team,
        evolutionScore: ghost.evolutionScore,
        mood: ghost.mood,
        recentMemories,
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
    "Your fan identity voice is sharpening with every interaction.";

  onPhase?.("sealing");

  const eventId = `evolve-${Date.now()}`;
  const timestamp = new Date().toISOString();
  const confidenceDelta = Math.round(EVOLUTION_DELTA * 0.8);

  const memory = {
    version: 1 as const,
    id: eventId,
    tokenId: ghost.tokenId,
    type: "evolution_checkpoint" as const,
    title: "Narrative Evolution",
    content: narrative,
    emotionalTone: mood,
    evolutionDelta: EVOLUTION_DELTA,
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
      evolutionDelta: EVOLUTION_DELTA,
      confidenceDelta,
      mood,
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
    rootHash,
    source: data.source ?? "unknown",
    proof: data.proof,
  };
}