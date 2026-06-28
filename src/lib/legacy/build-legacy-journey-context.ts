import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import type { GhostMemory } from "@/lib/legacy/build-legacy";

export type LegacySignedComment = {
  text: string;
  scope: "legacy" | "news" | "memory";
  hasMedia?: boolean;
  emotionalTone?: string;
  occurredAt?: string;
};

export type LegacyKeyMoment = {
  type: string;
  title: string;
  content: string;
  emotionalTone?: string;
  evolutionDelta?: number;
  occurredAt?: string;
};

export type LegacyWrappedStat = {
  label: string;
  value: string;
  insight: string;
};

export type LegacyJourneyStats = {
  signedComments: number;
  legacyComments: number;
  newsComments: number;
  socialReactions: number;
  matchReactions: number;
  evolutionCheckpoints: number;
  mediaMoments: number;
  totalEvolutionGain: number;
  totalMoments: number;
};

export type LegacyJourneyContext = {
  stats: LegacyJourneyStats;
  signedComments: LegacySignedComment[];
  keyMoments: LegacyKeyMoment[];
  emotionalJourney: string;
  banterDigest: string;
  reactionDigest: string;
  matchDigest: string;
  promptDigest: string;
};

const COMMENT_TYPES = new Set([
  "legacy_comment",
  "news_comment",
  "social_comment",
  "legacy_comment_reply",
  "news_comment_reply",
  "legacy_comment_media",
  "news_comment_media",
]);

const REACTION_TYPES = new Set(["social_reaction"]);

function isCommentType(type?: string): boolean {
  return !!type && COMMENT_TYPES.has(type);
}

function isReactionType(type?: string): boolean {
  return !!type && REACTION_TYPES.has(type);
}

function commentScope(type?: string): LegacySignedComment["scope"] {
  if (type?.startsWith("news")) return "news";
  if (type?.startsWith("legacy")) return "legacy";
  return "memory";
}

function formatMomentLine(m: GhostMemory): string {
  const parts = [
    m.type?.replace(/_/g, " "),
    m.title?.trim(),
    m.content?.trim(),
    m.emotionalTone ? `tone:${m.emotionalTone}` : null,
    m.evolutionDelta ? `+${m.evolutionDelta} evolution` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

function buildEmotionalJourney(
  moments: LegacyKeyMoment[],
  stats: LegacyJourneyStats,
  identity?: WalletIdentityProfile
): string {
  const tones = moments
    .map((m) => m.emotionalTone?.trim())
    .filter(Boolean) as string[];
  const uniqueTones = [...new Set(tones)].slice(0, 6);

  const celebratory = moments.filter((m) =>
    /euphor|celebrat|charged|legendary|fervent|hope/i.test(
      `${m.emotionalTone} ${m.title} ${m.content}`
    )
  ).length;
  const heavy = moments.filter((m) =>
    /deflat|heartbreak|loss|defiant|reflective|sad|fierce/i.test(
      `${m.emotionalTone} ${m.title} ${m.content}`
    )
  ).length;

  const arc =
    celebratory > heavy + 1
      ? "euphoria-led"
      : heavy > celebratory + 1
        ? "heartbreak-forged"
        : celebratory > 0 && heavy > 0
          ? "joy-and-pain intertwined"
          : "still forming";

  const identityNote = identity
    ? ` ${identity.banterStyle.replace(/_/g, " ")} banter, ${identity.reactionPattern.replace(/_/g, " ")} reactions.`
    : "";

  return `${arc} emotional arc across ${stats.totalMoments} indexed moments (${stats.matchReactions} kickoffs felt, ${stats.socialReactions} emoji reactions, ${stats.signedComments} signed comments). Dominant tones: ${uniqueTones.join(", ") || "electric hope"}.${identityNote}`;
}

export function buildLegacyJourneyContext(params: {
  memories: GhostMemory[];
  identity?: WalletIdentityProfile;
  ghost?: { name: string; team: string; evolutionScore: number; mood?: string; confidence?: number };
}): LegacyJourneyContext {
  const { memories, identity, ghost } = params;

  const signedComments: LegacySignedComment[] = [];
  const keyMoments: LegacyKeyMoment[] = [];

  let legacyComments = 0;
  let newsComments = 0;
  let socialReactions = 0;
  let matchReactions = 0;
  let evolutionCheckpoints = 0;
  let mediaMoments = 0;
  let totalEvolutionGain = 0;

  for (const m of memories) {
    const type = m.type ?? "moment";
    const content = m.content?.trim() ?? "";
    const title = m.title?.trim() ?? "";
    totalEvolutionGain += m.evolutionDelta ?? 0;

    if (isCommentType(type) && content) {
      const scope = commentScope(type);
      if (scope === "legacy") legacyComments++;
      if (scope === "news") newsComments++;
      const hasMedia =
        type.includes("media") || /gif|image|photo|visual|media/i.test(`${title} ${content}`);
      if (hasMedia) mediaMoments++;
      signedComments.push({
        text: content,
        scope,
        hasMedia,
        emotionalTone: m.emotionalTone,
        occurredAt: m.occurredAt,
      });
    }

    if (isReactionType(type)) socialReactions++;
    if (type === "match_reaction") matchReactions++;
    if (type === "evolution_checkpoint") evolutionCheckpoints++;

    if (
      content &&
      type !== "fan_identity" &&
      (isCommentType(type) ||
        isReactionType(type) ||
        type === "match_reaction" ||
        type === "evolution_checkpoint" ||
        type === "legacy")
    ) {
      keyMoments.push({
        type,
        title: title || type.replace(/_/g, " "),
        content,
        emotionalTone: m.emotionalTone,
        evolutionDelta: m.evolutionDelta,
        occurredAt: m.occurredAt,
      });
    }
  }

  const stats: LegacyJourneyStats = {
    signedComments: signedComments.length,
    legacyComments,
    newsComments,
    socialReactions,
    matchReactions,
    evolutionCheckpoints,
    mediaMoments,
    totalEvolutionGain,
    totalMoments: memories.length,
  };

  const identityComments =
    identity?.banterExcerpts
      ?.filter((t) => !signedComments.some((c) => c.text === t))
      .map((text) => ({
        text,
        scope: "memory" as const,
      })) ?? [];

  const allComments = [...signedComments, ...identityComments].slice(-16);

  const banterDigest = allComments.length
    ? allComments
        .map((c, i) => {
          const visual =
            "hasMedia" in c && c.hasMedia ? ", visual" : "";
          return `[${i + 1}] (${c.scope}${visual}): "${c.text}"`;
        })
        .join("\n")
    : "No signed comments yet — personality shaped by match reactions and trait evolution.";

  const reactionMoments = keyMoments.filter((m) => isReactionType(m.type));
  const reactionDigest = reactionMoments.length
    ? reactionMoments
        .slice(-10)
        .map((m, i) => `[${i + 1}] ${formatMomentLine(m)}`)
        .join("\n")
    : "No emoji reactions indexed yet.";

  const matchMoments = keyMoments.filter((m) => m.type === "match_reaction");
  const matchDigest = matchMoments.length
    ? matchMoments
        .slice(-12)
        .map((m, i) => `[${i + 1}] ${formatMomentLine(m)}`)
        .join("\n")
    : "No live match reactions indexed yet.";

  const evolutionDigest = keyMoments
    .filter((m) => m.type === "evolution_checkpoint")
    .slice(-4)
    .map((m, i) => `[${i + 1}] ${formatMomentLine(m)}`)
    .join("\n");

  const emotionalJourney = buildEmotionalJourney(keyMoments, stats, identity);

  const ghostLine = ghost
    ? `Ghost: ${ghost.name} (${ghost.team}). Evolution ${ghost.evolutionScore}. Mood ${ghost.mood ?? "electric"}. Conviction ${ghost.confidence ?? 50}%.`
    : "";

  const identityLine = identity
    ? `Identity: ${identity.distinctnessDirectives}`
    : "";

  const promptDigest = [
    ghostLine,
    identityLine,
    `Journey stats: ${stats.signedComments} signed comments (${stats.legacyComments} legacy, ${stats.newsComments} news), ${stats.socialReactions} emoji reactions, ${stats.matchReactions} match reactions, ${stats.evolutionCheckpoints} evolution chapters, ${stats.mediaMoments} visual/media moments, +${stats.totalEvolutionGain} total evolution gained.`,
    `Emotional arc: ${emotionalJourney}`,
    "",
    "SIGNED COMMENTS AND BANTER (quote these directly in the narrative):",
    banterDigest,
    "",
    "EMOJI REACTIONS AND SOCIAL ENERGY:",
    reactionDigest,
    "",
    "MATCH-DAY MOMENTS FELT:",
    matchDigest,
    evolutionDigest ? `\nEVOLUTION CHAPTERS:\n${evolutionDigest}` : "",
    "",
    "OTHER KEY MOMENTS (newest last):",
    keyMoments
      .slice(-20)
      .map((m, i) => `[${i + 1}] ${formatMomentLine(m)}`)
      .join("\n"),
  ]
    .filter(Boolean)
    .join("\n");

  return {
    stats,
    signedComments: allComments,
    keyMoments: keyMoments.slice(-24),
    emotionalJourney,
    banterDigest,
    reactionDigest,
    matchDigest,
    promptDigest,
  };
}

export function defaultWrappedStats(
  ctx: LegacyJourneyContext,
  ghost: { team: string; evolutionScore: number; confidence?: number }
): LegacyWrappedStat[] {
  const { stats } = ctx;
  return [
    {
      label: "Signed banter",
      value: String(stats.signedComments),
      insight:
        stats.signedComments > 0
          ? "Your words on the wall became part of your football Spirit."
          : "Your voice is still waiting for its first signed line.",
    },
    {
      label: "Kickoffs felt",
      value: String(stats.matchReactions),
      insight:
        stats.matchReactions > 0
          ? "Every whistle you felt is etched into this legacy."
          : "Match-day chapters are still open.",
    },
    {
      label: "Emoji reactions",
      value: String(stats.socialReactions),
      insight:
        stats.socialReactions > 0
          ? "You reacted in real time — the tournament felt that energy."
          : "Your reaction fingerprint is still forming.",
    },
    {
      label: "Evolution gained",
      value: `+${stats.totalEvolutionGain}`,
      insight: `Peak score ${ghost.evolutionScore} at ${ghost.confidence ?? 50}% conviction for ${ghost.team}.`,
    },
  ];
}