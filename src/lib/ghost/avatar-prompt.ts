import type { GhostTraits } from "@/types/ghost";

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
- Key Interactions: [SUMMARY OF COMMENTS, BANTER, REACTIONS, LEGACY MOMENTS]
- Mood: [MOOD]

Generation Rules:
- Each ghost must look visibly unique based on the user's interactions and personality.
- Same country + different personality = clearly different appearance.
- Higher evolution = more detailed, legendary look with stronger ghostly aura.
- Output as a premium vertical player card composition.

Generate a mature, cinematic, football-native ghost character that feels personal to the specific user's journey.`;

export function ghostEvolutionStage(score: number): string {
  if (score >= 80) return "Legend";
  if (score >= 50) return "Veteran";
  if (score >= 25) return "Awakened";
  if (score > 0) return "Growing";
  return "Newborn";
}

function formatTraits(traits: GhostTraits): string {
  const ranked = Object.entries(traits)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");
  return ranked;
}

export function buildGhostAvatarImagePrompt(params: {
  country: string;
  traits?: GhostTraits;
  mood?: string;
  evolutionScore?: number;
  memorySummary?: string;
}): string {
  const traits = params.traits ?? {
    passion: 70,
    loyalty: 70,
    drama: 50,
    hope: 70,
    resilience: 65,
  };

  return GHOST_AVATAR_PROMPT_TEMPLATE.replace("[COUNTRY]", params.country)
    .replace("[PERSONALITY TRAITS]", formatTraits(traits))
    .replace("[STAGE]", ghostEvolutionStage(params.evolutionScore ?? 0))
    .replace(
      "[SUMMARY OF COMMENTS, BANTER, REACTIONS, LEGACY MOMENTS]",
      params.memorySummary?.trim() ||
        "Freshly born: no comments, banter, reactions, or legacy moments yet."
    )
    .replace("[MOOD]", params.mood ?? "electric");
}