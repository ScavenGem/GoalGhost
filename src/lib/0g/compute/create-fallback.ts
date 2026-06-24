import type { GhostTraits, OgComputeProof } from "@/types/ghost";

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
  const seed = hashSeed(`${params.team}:${params.teamCode}:${JSON.stringify(params.traits)}`);
  const epithets = ["Spirit", "Sentinel", "Chant", "Flame", "Heartbeat", "Echo"];
  const name = `${titleCase(params.team)} ${pick(epithets, seed)}`;
  const mood = pick(MOODS, seed, 2);

  const backstory = `Born for ${params.team} on the road to the World Cup, ${name} carries the noise of every terrace, every last-minute prayer, and every heartbreak that came before. When 0G Compute could not answer in time, this identity was shaped locally from your nation and trait sliders so the birth ritual could continue. The loyalty still runs deep, the hope still burns, and every match from here will write the real story on 0G Storage.`;

  const voice =
    "Direct and match-day raw, speaking like a supporter who has watched every knockout twice and still believes.";

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