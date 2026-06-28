import type { OgComputeProof } from "@/types/ghost";
import type { LegacyApiOutput } from "@/lib/legacy/build-legacy";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";

type LegacyMemory = {
  title?: string;
  content?: string;
  type?: string;
  emotionalTone?: string;
};

function memoryLines(memories: LegacyMemory[]): string[] {
  return memories
    .map((m) => {
      const line = [m.type, m.title, m.content].filter(Boolean).join(": ");
      return line.trim();
    })
    .filter((line) => line.length > 0);
}

/**
 * Labeled offline fallback when live 0G Compute is unavailable or times out.
 */
export function buildLabeledFallbackLegacy(params: {
  ghost: {
    name: string;
    team: string;
    evolutionScore: number;
    mood?: string;
    confidence?: number;
  };
  memories: LegacyMemory[];
  identity?: WalletIdentityProfile;
  reason: string;
}): { legacy: LegacyApiOutput; proof: OgComputeProof } {
  const { ghost, memories, identity } = params;
  const lines = memoryLines(memories);
  const highlightPool =
    lines.length > 0
      ? lines.slice(0, 5)
      : [
          `Every ${ghost.team} kickoff felt personal`,
          "Match reactions etched into your fan identity",
          "Legacy and news conversations shaped your voice",
        ];

  const identityLine = identity
    ? ` A ${identity.banterStyle.replace(/_/g, " ")} voice with ${identity.reactionPattern.replace(/_/g, " ")} energy — ${identity.journeySignature}.`
    : "";
  const banterLine =
    identity?.banterExcerpts?.length
      ? ` Your signed words still echo: "${identity.banterExcerpts.slice(-3).join('" · "')}".`
      : "";

  const story = `${ghost.name}'s World Cup was never just scores on a screen. It was ${ghost.team} in the blood, ${memories.length} evolution chapters deep, and a fan identity that grew louder with every reaction, comment, and heartbreak.${identityLine}${banterLine} From the first whistle to the final reflection, this legacy belongs on 0G: permanent, wallet-owned (${identity?.walletFingerprint ?? "your wallet"}), and unmistakably yours. When live 0G Compute could not answer in time, this wrapped story was composed from your indexed journey so the unwrap ritual could continue.`;

  const transformationFrom =
    ghost.evolutionScore >= 50 ? "Hopeful supporter" : "Curious newcomer";
  const transformationTo =
    ghost.evolutionScore >= 80
      ? "Tournament legend"
      : ghost.evolutionScore >= 50
        ? "Veteran voice"
        : "Awakened fan";

  return {
    legacy: {
      story,
      highlights: highlightPool,
      transformation: {
        from: transformationFrom,
        to: transformationTo,
        arc: `You arrived carrying ${ghost.team} hope and leave carrying a story only your wallet can prove.`,
      },
      shareText: `My GoalGhost legacy for ${ghost.team} is unwrapped. ${ghost.evolutionScore} evolution · ${memories.length} chapters · forever on 0G.`,
      dominantMood: ghost.mood ?? (ghost.evolutionScore >= 50 ? "fierce" : "hopeful"),
      celebration: {
        title: highlightPool[0] ?? "The night everything clicked",
        body: `A ${ghost.team} moment that still glows in your fan journey, sealed as identity evolution on 0G Storage.`,
      },
      heartbreak: {
        title: "The result that still stings",
        body: `Even when the scoreline hurt, your GoalGhost kept the emotion honest and permanent.`,
      },
      rivalry: {
        title: `${ghost.team} vs the world`,
        body: `Every debate, every comment thread, every match reaction sharpened who you support and why.`,
      },
      fanIdentity: {
        title: identity
          ? `${ghost.name} — ${identity.evolutionArchetype}`
          : `${ghost.name}, forever ${ghost.team}`,
        body: identity
          ? `${identity.personalityPresentation} Conviction at ${ghost.confidence ?? 50}%. This is not a highlight reel — it is your football Spirit, evolved through signed banter, reactions, and match-day feeling, verified on 0G.`
          : `This is not a highlight reel. It is your football identity, evolved through the tournament and verified on 0G.`,
      },
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