import type { GhostTraits } from "@/types/ghost";

export const GHOST_AVATAR_PROMPT_TEMPLATE = `You are an expert football character designer creating premium, emotionally expressive GoalGhost avatars.

Core Style (strict):
- Premium modern cartoon style with high-quality illustration (PES/eFootball character quality mixed with expressive football energy).
- The character is a ghost-like football personality: humanoid football player shape (head, body, arms, legs) wearing the national team jersey and boots.
- Subtle ghost effects: soft translucency, glowing edges, slight floating/ethereal aura.
- Strong football elements: jersey details, boots, football, pitch elements, scarf, or celebration pose.
- Use exact national colors and symbols of the chosen country.
- Emotionally expressive face and body language.
- Premium, cool, and football-first feel. No scary or low-quality ghosts.

Dynamic Inputs:
- Country: [COUNTRY]
- Personality traits: [PERSONALITY]
- Current Mood: [MOOD]
- Evolution Stage: [STAGE]
- Personal Memories / Journey: [MEMORY SUMMARY]
- Overall vibe: [OPTIONAL]

Generation Rules:
- The ghost must reflect its country, personality, mood, evolution stage, and personal memories.
- Memories should visibly influence details (celebratory elements from wins, determined look from tough matches, etc.).
- Lower evolution stages = simpler/rawer look. Higher stages = more detailed kit and legendary presence.
- Make it feel like a unique, living football spirit that belongs to this specific user's journey.

Output only the image. No text.

Text style rule for any labels: never use em dashes.`;

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
    .replace("[PERSONALITY]", formatTraits(traits))
    .replace("[MOOD]", params.mood ?? "electric")
    .replace("[STAGE]", ghostEvolutionStage(params.evolutionScore ?? 0))
    .replace("[MEMORY SUMMARY]", params.memorySummary?.trim() || "Freshly born: no evolution chapters yet.")
    .replace("[OPTIONAL]", params.vibe?.trim() || "World Cup 2026 football spirit");
}