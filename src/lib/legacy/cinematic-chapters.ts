import type { LegacyDocument } from "@/types/legacy";
import type { GhostLegacyInput } from "@/lib/legacy/build-legacy";
import { legacyDisplayText } from "@/lib/legacy/cinematic-text";

export type CinematicChapterId = "birth" | "journey" | "evolution" | "legacy";

export type CinematicChapter = {
  id: CinematicChapterId;
  title: string;
  subtitle: string;
  body: string;
  accent: string;
  stats?: { value: string; label: string }[];
  moments?: { title: string; body: string; emoji: string }[];
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
  legacy: LegacyDocument
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
    .slice(0, 4)
    .map((h) => legacyDisplayText(h));

  return [
    {
      id: "birth",
      title: "The Birth",
      subtitle: `${ghost.name} enters the tournament`,
      body: legacyDisplayText(
        `${ghost.name} was born for ${ghost.team}. A football Spirit shaped by ${ghost.mood} energy and ${ghost.confidence}% conviction, ready to feel every whistle.`
      ),
      accent: "from-[#F4C542]/25 via-[#0A1020]/90 to-[#0A1020]",
      stats: [
        { value: ghost.team, label: "Nation carried" },
        { value: ghost.mood, label: "Starting Spirit" },
      ],
    },
    {
      id: "journey",
      title: "The Journey",
      subtitle: "Every moment that shaped you",
      body: legacyDisplayText(
        highlightLines.join(". ") ||
          "Match reactions, signed comments, and evolution chapters wrote your tournament in real time."
      ),
      accent: "from-sky-500/20 via-[#0A1020]/90 to-[#0A1020]",
      stats: [
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
    },
    {
      id: "evolution",
      title: "The Evolution",
      subtitle: "How your Spirit transformed",
      body: legacyDisplayText(legacy.transformation.arc),
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
      subtitle: "What remains when the final whistle blows",
      body: legacyDisplayText(moments.fanIdentity.body),
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
    },
  ];
}