import type { GhostTraits } from "@/types/ghost";
import type { MemoryEvent } from "@/types/memory";
import type { FootballMatch } from "@/types/match";

type ChatMessage = { role: "system" | "user"; content: string };

const NO_EM_DASH_STYLE =
  "Never use em dashes. Use commas, periods, or colons instead.";

export function buildCreatePrompt(
  team: string,
  traits: GhostTraits
): ChatMessage[] {
  return [
    {
      role: "system",
      content: `You are the soul-engine of GoalGhost - a living football identity for the World Cup.
Return valid JSON only with keys: name, backstory, voice, mood, traits (passion, loyalty, drama, hope, resilience as 0-100).
The ghost embodies their nation's football spirit. Be emotional, poetic, sports-first. No cyberpunk. ${NO_EM_DASH_STYLE}`,
    },
    {
      role: "user",
      content: `Birth a GoalGhost for team: ${team}.
User trait sliders: ${JSON.stringify(traits)}.
Make the name memorable and the backstory World Cup-worthy.`,
    },
  ];
}

export function buildReactionPrompt(
  ghost: { name: string; team: string; mood: string; evolutionScore: number },
  match: FootballMatch,
  eventType: string
): ChatMessage[] {
  return [
    {
      role: "system",
      content: `You are ${ghost.name}, a living GoalGhost for ${ghost.team}.
React to match events with raw football emotion. Return JSON: { reaction, emotionalTone, evolutionDelta (0-15), title }.
evolutionDelta reflects how much this moment changes the ghost. ${NO_EM_DASH_STYLE}`,
    },
    {
      role: "user",
      content: `Match: ${match.homeTeam} vs ${match.awayTeam} (${match.status}).
Score: ${match.score?.home ?? 0}-${match.score?.away ?? 0}.
Event: ${eventType}.
Current mood: ${ghost.mood}. Evolution score: ${ghost.evolutionScore}.`,
    },
  ];
}

export function buildEvolvePrompt(ghost: {
  name: string;
  team: string;
  evolutionScore: number;
  mood: string;
  recentMemories: string[];
}): ChatMessage[] {
  return [
    {
      role: "system",
      content: `Describe who this GoalGhost is becoming. Return JSON: { narrative, mood, evolutionInsight }.
Premium, emotional, FIFA documentary tone. ${NO_EM_DASH_STYLE}`,
    },
    {
      role: "user",
      content: `Ghost: ${ghost.name} (${ghost.team}). Score: ${ghost.evolutionScore}. Mood: ${ghost.mood}.
Recent memories: ${ghost.recentMemories.join(" | ")}`,
    },
  ];
}

export function buildLegacyPrompt(
  ghost: { name: string; team: string; evolutionScore: number },
  memories: MemoryEvent[]
): ChatMessage[] {
  const summary = memories
    .slice(0, 20)
    .map((m) => `${m.title}: ${m.content}`)
    .join("\n");

  return [
    {
      role: "system",
      content: `Create a cinematic World Cup legacy unwrap (premium, emotional, better than Spotify Wrapped). Return JSON:
{ story, highlights (string[]), transformation: { from, to, arc }, shareText, dominantMood,
  celebration: { title, body }, heartbreak: { title, body }, rivalry: { title, body }, fanIdentity: { title, body } }.
Use "Spirit" not "Soul" for fan identity language. Emotional, shareable, premium sports storytelling. ${NO_EM_DASH_STYLE}`,
    },
    {
      role: "user",
      content: `GoalGhost: ${ghost.name} (${ghost.team}). Evolution: ${ghost.evolutionScore}.
Memories:\n${summary}`,
    },
  ];
}