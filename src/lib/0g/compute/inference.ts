import type { OgComputeProof } from "@/types/ghost";
import { getChatbotProvider, getComputeBroker } from "./broker";
import {
  buildCreatePrompt,
  buildEvolvePrompt,
  buildLegacyPrompt,
  buildReactionPrompt,
} from "./prompts";
import type { GhostTraits } from "@/types/ghost";
import type { FootballMatch } from "@/types/match";
import type { MemoryEvent } from "@/types/memory";

export type InferenceTask =
  | { task: "create"; team: string; traits: GhostTraits }
  | {
      task: "reaction";
      ghost: { name: string; team: string; mood: string; evolutionScore: number };
      match: FootballMatch;
      eventType: string;
    }
  | {
      task: "evolve";
      ghost: {
        name: string;
        team: string;
        evolutionScore: number;
        mood: string;
        recentMemories: string[];
      };
    }
  | {
      task: "legacy";
      ghost: { name: string; team: string; evolutionScore: number };
      memories: MemoryEvent[];
    };

export type InferenceResult<T> = {
  output: T;
  proof: OgComputeProof;
};

/**
 * JUDGE NOTE - 0G COMPUTE INFERENCE
 * Ghost creation, match reactions, evolution narratives, and legacy
 * generation run on 0G Compute.
 */
export async function runGhostInference<T extends Record<string, unknown>>(
  params: InferenceTask
): Promise<InferenceResult<T>> {
  const broker = await getComputeBroker();
  const providerAddress = await getChatbotProvider();

  const messages = (() => {
    switch (params.task) {
      case "create":
        return buildCreatePrompt(params.team, params.traits);
      case "reaction":
        return buildReactionPrompt(params.ghost, params.match, params.eventType);
      case "evolve":
        return buildEvolvePrompt(params.ghost);
      case "legacy":
        return buildLegacyPrompt(params.ghost, params.memories);
    }
  })();

  const [{ endpoint, model }, headers] = await Promise.all([
    broker.inference.getServiceMetadata(providerAddress),
    broker.inference.getRequestHeaders(providerAddress),
  ]);

  const response = await fetch(`${endpoint}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: "json_object" },
      temperature: 0.85,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`0G Compute inference failed: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const chatId = response.headers.get("ZG-Res-Key") ?? data.id ?? null;

  let teeVerified = false;
  if (chatId) {
    try {
      const verified = await broker.inference.processResponse(
        providerAddress,
        chatId
      );
      teeVerified = verified === true;
    } catch {
      teeVerified = false;
    }
  }

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("0G Compute returned empty response");

  return {
    output: JSON.parse(raw) as T,
    proof: { provider: providerAddress, chatId, teeVerified },
  };
}