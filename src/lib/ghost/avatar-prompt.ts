import type { GhostTraits } from "@/types/ghost";

export const GHOST_AVATAR_PROMPT_TEMPLATE = `You are an expert cinematic football character designer creating premium, emotionally expressive GoalGhost avatars for a high-end World Cup fan identity platform.

Style Rules (strict):
- Premium cinematic football ghost aesthetic — hyper-realistic yet ethereal, inspired by high-end sports game character design (PES/eFootball level) mixed with subtle supernatural ghost elements.
- The character must clearly look like a **football spirit/ghost** (subtle translucency, soft ethereal glow, floating effect) while remaining deeply football-native and mature.
- Always include strong football elements: detailed kit, boots, football, pitch elements, or dynamic pose.
- Use exact national colors, crest, and cultural football details of the chosen country.
- High detail, premium materials, emotional facial expression and body language.
- No cartoonish, babyish, or low-quality looks. The character must feel serious, emotional, and high-end.

Dynamic Inputs (use these to shape the character):
- Country: [COUNTRY]
- Personality traits: [PERSONALITY TRAITS]
- Evolution Stage: [STAGE] (Newborn / Growing / Awakened / Veteran / Legend)
- Key Memories & Interactions: [SUMMARY OF SIGNED COMMENTS, REACTIONS, BANTER, LEGACY MOMENTS]
- Dominant Mood: [CURRENT MOOD]
- Overall vibe: [OPTIONAL USER VIBE]

Generation Rules:
- The ghost must visually reflect the user's unique journey and personality. Different users must produce visibly different characters.
- Higher evolution stages = more detailed kit, stronger presence, more legendary aura, and refined ghostly effects.
- Mood must be clearly visible in expression and posture.
- Include at least one clear football action element (ball, celebration pose, or dynamic stance).
- Cinematic lighting, premium atmosphere, and subtle 0G ethereal energy.

Output Format:
Generate the character as a high-quality vertical card composition (like a premium football player card), ready for both static display and potential animation. The character should feel alive and personal to the specific wallet's history on the platform.

Do not reuse generic ghost designs. Every output must feel unique to the inputs provided.`;

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
  vibe?: string;
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
      "[SUMMARY OF SIGNED COMMENTS, REACTIONS, BANTER, LEGACY MOMENTS]",
      params.memorySummary?.trim() ||
        "Freshly born: no signed comments, reactions, banter, or legacy moments yet."
    )
    .replace("[CURRENT MOOD]", params.mood ?? "electric")
    .replace("[OPTIONAL USER VIBE]", params.vibe?.trim() || "World Cup 2026 football spirit");
}