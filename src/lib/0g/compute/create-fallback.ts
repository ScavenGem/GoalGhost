import type { GhostTraits, OgComputeProof } from "@/types/ghost";
import {
  creationIdentityName,
  type WalletIdentityProfile,
} from "@/lib/ghost/identity-distinctness";
import { FALLBACK_NARRATIVE_NOTE } from "@/lib/0g/compute/fallback-messages";

const MOODS = [
  "electric",
  "hopeful",
  "fierce",
  "calm",
  "defiant",
  "euphoric",
] as const;

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick<T>(items: readonly T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length]!;
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Labeled offline fallback when live 0G Compute is unavailable or times out.
 * Clearly marked in computeProof — not a substitute for live TEE inference.
 */
export function buildLabeledFallbackGhost(params: {
  team: string;
  teamCode: string;
  traits: GhostTraits;
  walletAddress?: string;
  identity?: WalletIdentityProfile;
  reason: string;
}): {
  ghost: {
    name: string;
    backstory: string;
    voice: string;
    mood: string;
    traits: GhostTraits;
    team: string;
    teamCode: string;
    evolutionScore: number;
  };
  proof: OgComputeProof;
} {
  const walletKey = params.walletAddress?.toLowerCase() ?? "";
  const seed = hashSeed(
    `${walletKey}:${params.team}:${params.teamCode}:${JSON.stringify(params.traits)}`
  );
  const identity = params.identity;
  const name = identity
    ? creationIdentityName(params.team, identity)
    : `${titleCase(params.team)} ${pick(["Spirit", "Sentinel", "Chant", "Flame", "Heartbeat", "Echo"], seed)}`;
  const mood = pick(MOODS, seed, 2);

  const voice =
    identity?.voiceSignature ??
    "Direct and match-day raw, speaking like a supporter who has watched every knockout twice and still believes.";

  const backstory = identity
    ? `Born for ${params.team} with a wallet fingerprint only yours (${identity.walletFingerprint}), ${name} arrives as a ${identity.banterStyle.replace(/_/g, " ")} voice — ${identity.personalityPresentation} ${FALLBACK_NARRATIVE_NOTE} No other supporter shares this exact voice or visual accent.`
    : `Born for ${params.team} on the road to the World Cup, ${name} carries the noise of every terrace, every last-minute prayer, and every heartbreak that came before. ${FALLBACK_NARRATIVE_NOTE} The loyalty still runs deep, the hope still burns, and every match from here will write the real story on 0G Storage.`;

  return {
    ghost: {
      name,
      backstory,
      voice,
      mood,
      traits: params.traits,
      team: params.team,
      teamCode: params.teamCode,
      evolutionScore: 0,
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