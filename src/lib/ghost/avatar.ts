import type { GhostTraits } from "@/types/ghost";
import type { GhostMemorySnapshot } from "@/lib/ghost/avatar-visual-profile";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import { buildPremiumGhostCardDataUri } from "@/lib/ghost/avatar-premium-card";

/** All platform avatars use the premium mature player-card renderer. */
export function buildGhostAvatarDataUri(params: {
  team: string;
  teamCode?: string;
  walletAddress?: string;
  traits?: GhostTraits;
  mood?: string;
  name: string;
  evolutionScore?: number;
  confidence?: number;
  memories?: GhostMemorySnapshot[];
  memorySummary?: string;
  identity?: WalletIdentityProfile;
}): string {
  return buildPremiumGhostCardDataUri(params);
}

export type { GhostMemorySnapshot };
export { buildAvatarVisualProfile } from "@/lib/ghost/avatar-visual-profile";
export { buildGhostAvatarImagePrompt } from "@/lib/ghost/avatar-prompt";