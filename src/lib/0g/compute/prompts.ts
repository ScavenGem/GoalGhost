import type { GhostTraits } from "@/types/ghost";
import type { MemoryEvent } from "@/types/memory";
import type { FootballMatch } from "@/types/match";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";

type ChatMessage = { role: "system" | "user"; content: string };

const NO_EM_DASH_STYLE =
  "Never use em dashes. Use commas, periods, or colons instead.";

const DISTINCTNESS_RULE = `CRITICAL DISTINCTNESS: No two GoalGhosts may feel alike. Same country + different wallets must produce clearly different names, voices, moods, visual presentation, and narrative personality. Heavily weight this wallet's unique comments, banter style, reaction patterns, and evolution path.`;

export function buildCreatePrompt(
  team: string,
  traits: GhostTraits,
  identity?: WalletIdentityProfile
): ChatMessage[] {
  const identityBlock = identity
    ? `Wallet fingerprint: ${identity.walletFingerprint}.
Distinctness directives: ${identity.distinctnessDirectives}
Suggested epithet direction: ${identity.nameEpithet}.
Voice signature: ${identity.voiceSignature}.
Banter style seed: ${identity.banterStyle.replace(/_/g, " ")}.`
    : "";

  return [
    {
      role: "system",
      content: `You are the soul-engine of GoalGhost, a living football identity for the World Cup.
Return valid JSON only with keys: name, backstory, voice, mood, traits (passion, loyalty, drama, hope, resilience as 0-100).
The ghost embodies their nation's football spirit with a personality that is unique to THIS wallet from birth.
Be emotional, poetic, sports-first. No cyberpunk. No generic names. ${DISTINCTNESS_RULE} ${NO_EM_DASH_STYLE}`,
    },
    {
      role: "user",
      content: `Birth a GoalGhost for team: ${team}.
User trait sliders: ${JSON.stringify(traits)}.
${identityBlock}
Make the name memorable, non-generic, and World Cup-worthy. The backstory and voice must feel impossible to confuse with another user's ghost.`,
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
  confidence?: number;
  traits?: GhostTraits;
  recentMemories: string[];
  interactionCount?: number;
  identity?: WalletIdentityProfile;
}): ChatMessage[] {
  const traitsLine = ghost.traits
    ? `Traits: passion ${ghost.traits.passion}, loyalty ${ghost.traits.loyalty}, drama ${ghost.traits.drama}, hope ${ghost.traits.hope}, resilience ${ghost.traits.resilience}.`
    : "";
  const interactionLine =
    ghost.interactionCount != null
      ? `${ghost.interactionCount} cumulative interactions (comments, reactions, matches, media) are shaping this evolution.`
      : "";
  const identityBlock = ghost.identity
    ? `Wallet identity: ${ghost.identity.distinctnessDirectives}`
    : "";

  return [
    {
      role: "system",
      content: `Describe who this GoalGhost is becoming based on their full fan journey.
Every signed comment, emoji reaction, GIF/image upload, and match reaction has contributed to this moment.
The narrative must reflect THIS wallet's banter style, reaction patterns, and evolution path so no other user would receive the same story.
Return JSON: { narrative, mood, evolutionInsight }.
Premium, emotional, FIFA documentary tone. ${DISTINCTNESS_RULE} ${NO_EM_DASH_STYLE}`,
    },
    {
      role: "user",
      content: `Ghost: ${ghost.name} (${ghost.team}). Evolution score: ${ghost.evolutionScore}. Mood: ${ghost.mood}. Conviction: ${ghost.confidence ?? 50}%.
${traitsLine}
${interactionLine}
${identityBlock}
Recent journey (newest last): ${ghost.recentMemories.join(" | ")}`,
    },
  ];
}

export function buildLegacyPrompt(
  ghost: {
    name: string;
    team: string;
    evolutionScore: number;
    mood?: string;
    confidence?: number;
  },
  memories: MemoryEvent[],
  identity?: WalletIdentityProfile
): ChatMessage[] {
  const summary = memories
    .slice(0, 24)
    .map((m) => `${m.type ?? "moment"}: ${m.title}: ${m.content}`)
    .join("\n");

  const identityBlock = identity
    ? `Wallet identity for personalization: ${identity.distinctnessDirectives}
Signed banter excerpts: ${identity.banterExcerpts.join(" · ") || "none yet"}`
    : "";

  return [
    {
      role: "system",
      content: `Create a cinematic World Cup legacy unwrap (premium, emotional, better than Spotify Wrapped) that feels impossible to confuse with any other wallet's journey.
Return JSON:
{ story, highlights (string[]), transformation: { from, to, arc }, shareText, dominantMood,
  celebration: { title, body }, heartbreak: { title, body }, rivalry: { title, body }, fanIdentity: { title, body } }.
Quote or echo the user's actual banter and reaction patterns where possible.
Use "Spirit" not "Soul" for fan identity language. ${DISTINCTNESS_RULE} ${NO_EM_DASH_STYLE}`,
    },
    {
      role: "user",
      content: `GoalGhost: ${ghost.name} (${ghost.team}). Evolution: ${ghost.evolutionScore}. Mood: ${ghost.mood ?? "electric"}. Conviction: ${ghost.confidence ?? 50}%.
${identityBlock}
Memories and signed interactions:
${summary}`,
    },
  ];
}