export type GhostTraits = {
  passion: number;
  loyalty: number;
  drama: number;
  hope: number;
  resilience: number;
};

export type GhostProfile = {
  version: 1;
  walletAddress: string;
  tokenId?: number;
  name: string;
  backstory: string;
  team: string;
  teamCode: string;
  traits: GhostTraits;
  mood: string;
  evolutionScore: number;
  voice: string;
  createdAt: string;
  computeProof?: OgComputeProof;
};

export type OgComputeProof = {
  provider: string;
  chatId: string | null;
  teeVerified: boolean;
  /** True when live 0G Compute was unavailable and a labeled local fallback was used. */
  fallback?: boolean;
  fallbackReason?: string;
};