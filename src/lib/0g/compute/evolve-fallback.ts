import type { OgComputeProof } from "@/types/ghost";

function evolutionStage(score: number): string {
  if (score >= 80) return "Legend";
  if (score >= 50) return "Veteran";
  if (score >= 25) return "Awakened";
  if (score > 0) return "Growing";
  return "Newborn";
}

/**
 * Labeled offline fallback when live 0G Compute is unavailable or times out.
 */
export function buildLabeledFallbackEvolution(params: {
  ghost: {
    name: string;
    team: string;
    evolutionScore: number;
    mood: string;
    recentMemories: string[];
  };
  reason: string;
}): {
  evolution: {
    narrative: string;
    mood: string;
    evolutionInsight: string;
  };
  proof: OgComputeProof;
} {
  const { ghost } = params;
  const stage = evolutionStage(ghost.evolutionScore);
  const memoryHint =
    ghost.recentMemories.length > 0
      ? ghost.recentMemories.slice(-3).join("; ")
      : "every match felt, every comment left, every reaction shared";

  const narrative = `${ghost.name} is no longer just a fan of ${ghost.team}. They are becoming a ${stage.toLowerCase()} voice in the tournament, shaped by ${memoryHint}. The ${ghost.mood} energy they carry now feels earned, not assigned, as legacy comments, news debates, and match-day reactions stack into one unmistakable identity. When 0G Compute could not answer in time, this evolution chapter was narrated locally from your verified fan journey so the ritual could continue.`;

  const evolutionInsight =
    ghost.evolutionScore >= 50
      ? "The ghost is crossing from supporter to symbol — memory density is high enough to change how they speak."
      : ghost.evolutionScore >= 25
        ? "Identity is consolidating: reactions and conversations are starting to rhyme."
        : "Early chapters are forming — each new comment and match reaction will sharpen the voice.";

  return {
    evolution: {
      narrative,
      mood: ghost.mood,
      evolutionInsight,
    },
    proof: {
      provider: "goalghost-labeled-fallback",
      chatId: null,
      teeVerified: false,
      fallback: true,
      fallbackReason: params.reason,
    },
  };
}