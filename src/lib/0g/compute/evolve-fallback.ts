import type { OgComputeProof } from "@/types/ghost";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import { FALLBACK_NARRATIVE_NOTE } from "@/lib/0g/compute/fallback-messages";

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
    confidence?: number;
    recentMemories: string[];
    interactionCount?: number;
    identity?: WalletIdentityProfile;
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

  const interactionNote =
    ghost.interactionCount != null && ghost.interactionCount > 0
      ? `${ghost.interactionCount} signed interactions`
      : "every comment, reaction, and upload";

  const identityNote = ghost.identity
    ? `Their ${ghost.identity.banterStyle.replace(/_/g, " ")} banter and ${ghost.identity.reactionPattern.replace(/_/g, " ")} reaction pattern mark them as ${ghost.identity.evolutionArchetype}.`
    : "";
  const banterEcho =
    ghost.identity?.banterExcerpts?.length
      ? ` Echoes of their signed voice: "${ghost.identity.banterExcerpts.slice(-2).join('" · "')}".`
      : "";

  const narrative = `${ghost.name} is no longer just a fan of ${ghost.team}. They are becoming a ${stage.toLowerCase()} voice in the tournament, shaped by ${memoryHint}. The ${ghost.mood} energy they carry now feels earned at ${ghost.confidence ?? 50}% conviction, built from ${interactionNote} stacking into one unmistakable identity. ${identityNote}${banterEcho} Legacy banter, news debates, emoji reactions, and match-day feelings are all visible in who they are becoming. ${FALLBACK_NARRATIVE_NOTE}`;

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