import type { GhostTraits } from "@/types/ghost";
import type { MemoryEvent } from "@/types/memory";
import type { FootballMatch } from "@/types/match";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import type { LegacyJourneyContext } from "@/lib/legacy/build-legacy-journey-context";

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
  identity?: WalletIdentityProfile,
  journey?: LegacyJourneyContext
): ChatMessage[] {
  const journeyBlock =
    journey?.promptDigest ??
    memories
      .slice(0, 32)
      .map((m) => `${m.type ?? "moment"}: ${m.title}: ${m.content}`)
      .join("\n");

  return [
    {
      role: "system",
      content: `You are writing a premium "Spotify Wrapped for a football Spirit" — a deeply personal World Cup legacy unwrap.
This must feel story-rich, emotionally specific, and impossible to confuse with any other wallet.

Rules:
- Pull HEAVILY from the user's signed comments, emoji reactions, match moments, and evolution chapters provided below.
- The story must quote or closely paraphrase at least 2-4 actual signed comments when they exist.
- Name specific emotional beats: what they celebrated, what broke them, what they argued about, how their banter evolved.
- highlights must be 8-12 vivid lines, each referencing a real interaction or moment (not generic football clichés).
- interactionQuotes must lift actual user words with context (where/when/why they said it).
- banterChapter is a dedicated mini-chapter about their comments-wall personality.
- wrappedStats are 4 "Wrapped card" stats with punchy insights tied to their real numbers.
- emotionalArc is one rich paragraph tracing their emotional journey through the tournament.
- celebration, heartbreak, rivalry, fanIdentity bodies must each be 2-4 sentences referencing real moments.
- story is the main narrative: 4-6 paragraphs, documentary tone, FIFA premium, weaving quotes and reactions throughout.
- transformation.arc must describe their specific evolution path using their interactions.

Return JSON only:
{
  story, highlights (string[]), transformation: { from, to, arc }, shareText, dominantMood,
  emotionalArc, banterChapter: { title, body },
  interactionQuotes: [{ quote, context }],
  wrappedStats: [{ label, value, insight }],
  celebration: { title, body }, heartbreak: { title, body }, rivalry: { title, body }, fanIdentity: { title, body }
}
Use "Spirit" not "Soul". ${DISTINCTNESS_RULE} ${NO_EM_DASH_STYLE}`,
    },
    {
      role: "user",
      content: `GoalGhost: ${ghost.name} (${ghost.team}). Evolution: ${ghost.evolutionScore}. Mood: ${ghost.mood ?? "electric"}. Conviction: ${ghost.confidence ?? 50}%.

Full wallet journey (signed banter, reactions, matches, evolution — use ALL of this):
${journeyBlock}`,
    },
  ];
}