import type { OgComputeProof } from "./ghost";

export type MemoryType =
  | "match_reaction"
  | "milestone"
  | "evolution_checkpoint"
  | "legacy"
  | "social_comment"
  | "social_reaction";

export type MemoryEvent = {
  version: 1;
  id: string;
  tokenId: number;
  type: MemoryType;
  matchId?: string;
  title: string;
  content: string;
  emotionalTone: string;
  evolutionDelta: number;
  timestamp: string;
  computeProof?: OgComputeProof;
  metadata?: Record<string, unknown>;
};