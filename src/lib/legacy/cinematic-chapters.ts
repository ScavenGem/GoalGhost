import type { LegacyDocument } from "@/types/legacy";
import type { GhostLegacyInput } from "@/lib/legacy/build-legacy";
import { legacyDisplayText } from "@/lib/legacy/cinematic-text";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";

export type CinematicChapterId = "birth" | "journey" | "evolution" | "legacy";

export type CinematicChapter = {
  id: CinematicChapterId;
  title: string;
  subtitle: string;
  body: string;
  accent: string;
  stats?: { value: string; label: string }[];
  moments?: { title: string; body: string; emoji: string }[];
  quotes?: { quote: string; context: string }[];
};

export type EvolutionStage = {
  id: string;
  label: string;
  active: boolean;
};

const EVOLUTION_STAGES = ["Newborn", "Growing", "Awakened", "Veteran", "Legend"] as const;

export function evolutionStagesForScore(score: number): EvolutionStage[] {
  const threshold = [0, 20, 40, 60, 80];
  let activeIndex = 0;
  for (let i = threshold.length - 1; i >= 0; i--) {
    if (score >= threshold[i]) {
      activeIndex = i;
      break;
    }
  }
  return EVOLUTION_STAGES.map((label, i) => ({
    id: label.toLowerCase(),
    label,
    active: i <= activeIndex,
  }));
}

export function cinematicHighlightStages(score: number): string[] {
  const stages = evolutionStagesForScore(score);
  const active = stages.filter((s) => s.active).map((s) => s.label);
  if (active.length <= 1) return ["Newborn", "Awakened", "Legend"];
  if (active.length === 2) return [active[0], "Awakened", "Legend"];
  return [active[0], active[Math.floor(active.length / 2)], active[active.length - 1]];
}

export function buildCinematicChapters(
  ghost: GhostLegacyInput,
  legacy: LegacyDocument,
  identity?: WalletIdentityProfile
): CinematicChapter[] {
  const moments = legacy.moments!;
  const journeyMoments = [
    {
      title: legacyDisplayText(moments.celebration.title),
      body: legacyDisplayText(moments.celebration.body),
      emoji: "🎉",
    },
    {
      title: legacyDisplayText(moments.heartbreak.title),
      body: legacyDisplayText(moments.heartbreak.body),
      emoji: "💔",
    },
    {
      title: legacyDisplayText(moments.rivalry.title),
      body: legacyDisplayText(moments.rivalry.body),
      emoji: "⚔️",
    },
  ];

  const highlightLines = legacy.highlights
    .slice(0, 8)
    .map((h) => legacyDisplayText(h));

  const birthBody = identity
    ? `${ghost.name} was born for ${ghost.team} with a ${identity.banterStyle.replace(/_/g, " ")} voice — ${identity.voiceSignature}. A football Spirit shaped by ${ghost.mood} energy and ${ghost.confidence}% conviction, fingerprinted to wallet ${identity.walletFingerprint}.`
    : `${ghost.name} was born for ${ghost.team}. A football Spirit shaped by ${ghost.mood} energy and ${ghost.confidence}% conviction, ready to feel every whistle.`;

  const journeyLead = legacy.banterChapter?.body
    ? legacyDisplayText(legacy.banterChapter.body)
    : identity?.banterExcerpts?.length
      ? `Your signed banter shaped everything: "${identity.banterExcerpts.slice(-2).join('" · "')}".`
      : null;

  const journeyBody = [
    journeyLead,
    highlightLines.length > 0
      ? highlightLines.join(". ")
      : identity?.journeySignature ??
        "Match reactions, signed comments, and evolution chapters wrote your tournament in real time.",
    legacy.emotionalArc ? legacyDisplayText(legacy.emotionalArc) : null,
  ]
    .filter(Boolean)
    .join(" ");

  const evolutionBody = [
    legacyDisplayText(legacy.transformation.arc),
    identity ? identity.personalityPresentation : null,
    legacy.emotionalArc && !journeyLead
      ? legacyDisplayText(legacy.emotionalArc)
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  const legacyBody = [
    legacyDisplayText(moments.fanIdentity.body),
    legacy.interactionQuotes?.length
      ? `The wall remembers: "${legacyDisplayText(legacy.interactionQuotes[legacy.interactionQuotes.length - 1]!.quote)}".`
      : identity?.banterExcerpts?.length
        ? `The comments wall remembers: "${identity.banterExcerpts.slice(-1)[0]}".`
        : null,
  ]
    .filter(Boolean)
    .join(" ");

  const wrappedStats = legacy.wrappedStats?.slice(0, 4);

  return [
    {
      id: "birth",
      title: "The Birth",
      subtitle: identity
        ? `${ghost.name} — ${identity.nameEpithet} of ${ghost.team}`
        : `${ghost.name} enters the tournament`,
      body: legacyDisplayText(birthBody),
      accent: "from-[#F4C542]/25 via-[#0A1020]/90 to-[#0A1020]",
      stats: [
        { value: ghost.team, label: "Nation carried" },
        {
          value: identity?.banterStyle.replace(/_/g, " ") ?? ghost.mood,
          label: identity ? "Banter style" : "Starting Spirit",
        },
      ],
    },
    {
      id: "journey",
      title: "The Journey",
      subtitle: legacy.banterChapter?.title
        ? legacyDisplayText(legacy.banterChapter.title)
        : identity
          ? `${identity.reactionPattern.replace(/_/g, " ")} energy across the tournament`
          : "Every moment that shaped you",
      body: legacyDisplayText(journeyBody),
      accent: "from-sky-500/20 via-[#0A1020]/90 to-[#0A1020]",
      stats: wrappedStats?.length
        ? wrappedStats.slice(0, 2).map((s) => ({ value: s.value, label: s.label }))
        : [
            {
              value: String(legacy.stats.matchesWitnessed),
              label: "Chapters witnessed",
            },
            {
              value: String(highlightLines.length),
              label: "Defining highlights",
            },
          ],
      moments: journeyMoments,
      quotes: legacy.interactionQuotes?.slice(0, 3),
    },
    {
      id: "evolution",
      title: "The Evolution",
      subtitle: identity
        ? identity.evolutionArchetype
        : "How your Spirit transformed",
      body: legacyDisplayText(evolutionBody),
      accent: "from-violet-500/20 via-[#0A1020]/90 to-[#0A1020]",
      stats: [
        {
          value: `${legacy.transformation.from} → ${legacy.transformation.to}`,
          label: "Transformation",
        },
        {
          value: String(legacy.stats.peakEvolution),
          label: "Evolution score",
        },
      ],
    },
    {
      id: "legacy",
      title: "The Legacy",
      subtitle: identity
        ? `Wallet ${identity.walletFingerprint} — yours alone`
        : "What remains when the final whistle blows",
      body: legacyDisplayText(legacyBody),
      accent: "from-[#F4C542]/30 via-[#0A1020]/90 to-[#0A1020]",
      stats: [
        {
          value: legacyDisplayText(legacy.stats.dominantMood),
          label: "Dominant Spirit",
        },
        {
          value: legacyDisplayText(moments.fanIdentity.title),
          label: "Final identity",
        },
      ],
      quotes: legacy.interactionQuotes?.slice(-2),
    },
  ];
}