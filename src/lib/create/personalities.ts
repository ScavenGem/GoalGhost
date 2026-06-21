import type { GhostTraits } from "@/types/ghost";

export type PersonalityArchetype = {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  traits: GhostTraits;
};

export const PERSONALITY_ARCHETYPES: PersonalityArchetype[] = [
  {
    id: "loyal",
    name: "Loyal",
    tagline: "Steadfast. Unbreakable. Never walks alone.",
    emoji: "🛡️",
    traits: { passion: 70, loyalty: 95, drama: 35, hope: 65, resilience: 90 },
  },
  {
    id: "funny",
    name: "Funny",
    tagline: "Football is joy. Banter is sacred. Goals are punchlines.",
    emoji: "😄",
    traits: { passion: 75, loyalty: 60, drama: 70, hope: 80, resilience: 55 },
  },
  {
    id: "tactical",
    name: "Tactical",
    tagline: "Reads the game. Feels it deeper than most.",
    emoji: "♟️",
    traits: { passion: 55, loyalty: 70, drama: 40, hope: 75, resilience: 85 },
  },
  {
    id: "emotional",
    name: "Emotional",
    tagline: "Every match is opera. Every goal, catharsis.",
    emoji: "💛",
    traits: { passion: 90, loyalty: 75, drama: 85, hope: 70, resilience: 60 },
  },
  {
    id: "dreamer",
    name: "Dreamer",
    tagline: "Believes in miracles until the final whistle.",
    emoji: "✨",
    traits: { passion: 65, loyalty: 75, drama: 45, hope: 95, resilience: 70 },
  },
  {
    id: "fervent",
    name: "Fervent",
    tagline: "Fire in the veins. Loyalty without limits.",
    emoji: "🔥",
    traits: { passion: 95, loyalty: 92, drama: 70, hope: 60, resilience: 75 },
  },
];