import type { GhostTraits } from "@/types/ghost";
import { ghostEvolutionStage } from "@/lib/ghost/evolution";
import {
  buildAvatarVisualProfile,
  type GhostMemorySnapshot,
} from "@/lib/ghost/avatar-visual-profile";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";

export { ghostEvolutionStage };

export const GHOST_AVATAR_PROMPT_TEMPLATE = `You are creating premium, mature football ghost characters for GoalGhost.

Style Rules (strict and non-negotiable):
- Hyper-realistic cinematic football player + ethereal ghost hybrid.
- Mature, serious, high-detail design (like premium sports game characters).
- Subtle translucency, glowing ethereal energy, floating effect, but the core is a strong football player.
- Detailed kit with national colors and crest.
- Emotional facial expression and body language.
- No cartoonish, babyish, simplistic, or playful designs. Absolutely no big head or toy-like proportions.

Dynamic Inputs (must influence the output strongly):
- Country: [COUNTRY] — use exact national kit colors and symbols.
- Personality: [PERSONALITY TRAITS]
- Evolution Stage: [STAGE]
- Conviction: [CONVICTION]%
- Key Interactions: [SUMMARY OF COMMENTS, BANTER, REACTIONS, LEGACY MOMENTS]
- Mood: [MOOD]
- Visual Directives: [VISUAL DIRECTIVES]

Generation Rules:
- Each ghost must look visibly unique based on the user's interactions and personality.
- Same country + different personality = clearly different appearance.
- Higher evolution = more detailed, legendary look with stronger ghostly aura.
- More intense interactions (strong comments, high conviction reactions, media uploads) = stronger presence and pronounced ethereal effects.
- Output as a premium vertical player card composition.

Generate a mature, cinematic, football-native ghost character that feels personal to the specific user's journey.`;

function formatTraits(traits: GhostTraits): string {
  return Object.entries(traits)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
}

export function buildGhostAvatarImagePrompt(params: {
  country: string;
  team?: string;
  name?: string;
  walletAddress?: string;
  teamCode?: string;
  traits?: GhostTraits;
  mood?: string;
  evolutionScore?: number;
  confidence?: number;
  memories?: GhostMemorySnapshot[];
  memorySummary?: string;
  identity?: WalletIdentityProfile;
}): string {
  const profile = buildAvatarVisualProfile({
    name: params.name ?? "GoalGhost",
    team: params.team ?? params.country,
    teamCode: params.teamCode,
    walletAddress: params.walletAddress,
    traits: params.traits,
    mood: params.mood,
    evolutionScore: params.evolutionScore,
    confidence: params.confidence,
    memories: params.memories,
    memorySummary: params.memorySummary,
    identity: params.identity,
  });

  return GHOST_AVATAR_PROMPT_TEMPLATE.replace("[COUNTRY]", params.country)
    .replace("[PERSONALITY TRAITS]", formatTraits(profile.traits))
    .replace("[STAGE]", profile.stage)
    .replace("[CONVICTION]", String(profile.conviction))
    .replace(
      "[SUMMARY OF COMMENTS, BANTER, REACTIONS, LEGACY MOMENTS]",
      profile.interactionSummary
    )
    .replace("[MOOD]", profile.mood)
    .replace("[VISUAL DIRECTIVES]", profile.visualDirectives);
}