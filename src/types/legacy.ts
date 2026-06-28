import type { OgComputeProof } from "./ghost";

export type LegacyMoment = {
  title: string;
  body: string;
};

export type LegacyInteractionQuote = {
  quote: string;
  context: string;
};

export type LegacyWrappedStat = {
  label: string;
  value: string;
  insight: string;
};

export type LegacyDocument = {
  version: 1;
  tokenId: number;
  season: string;
  story: string;
  highlights: string[];
  transformation: {
    from: string;
    to: string;
    arc: string;
  };
  stats: {
    matchesWitnessed: number;
    peakEvolution: number;
    dominantMood: string;
    topMemory: string;
  };
  moments?: {
    celebration: LegacyMoment;
    heartbreak: LegacyMoment;
    rivalry: LegacyMoment;
    fanIdentity: LegacyMoment;
  };
  shareText: string;
  generatedAt: string;
  computeProof?: OgComputeProof;
  emotionalArc?: string;
  banterChapter?: LegacyMoment;
  interactionQuotes?: LegacyInteractionQuote[];
  wrappedStats?: LegacyWrappedStat[];
};