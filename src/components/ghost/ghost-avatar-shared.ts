import type { GhostTraits } from "@/types/ghost";
import type { GhostMemorySnapshot } from "@/lib/ghost/avatar-visual-profile";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import { ghostEvolutionStage } from "@/lib/ghost/evolution";

export type GhostAvatarProps = {
  name: string;
  team: string;
  teamCode?: string;
  walletAddress?: string;
  traits?: GhostTraits;
  mood?: string;
  evolutionScore?: number;
  confidence?: number;
  memories?: GhostMemorySnapshot[];
  memorySummary?: string;
  identity?: WalletIdentityProfile;
  size?: number;
  className?: string;
  animate?: boolean;
  expandable?: boolean;
};

export function ghostAvatarStage(evolutionScore?: number): string {
  return ghostEvolutionStage(evolutionScore ?? 0);
}