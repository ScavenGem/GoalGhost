import type { OgComputeProof } from "@/types/ghost";
import type { LegacyApiOutput } from "@/lib/legacy/build-legacy";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import {
  buildLegacyJourneyContext,
  defaultWrappedStats,
  type LegacyJourneyContext,
} from "@/lib/legacy/build-legacy-journey-context";
import { FALLBACK_NARRATIVE_NOTE } from "@/lib/0g/compute/fallback-messages";

type LegacyMemory = {
  title?: string;
  content?: string;
  type?: string;
  emotionalTone?: string;
  evolutionDelta?: number;
  occurredAt?: string;
};

function pickQuote(
  ctx: LegacyJourneyContext
): { quote: string; context: string }[] {
  return ctx.signedComments.slice(-4).map((c, i) => ({
    quote: c.text,
    context:
      c.scope === "legacy"
        ? `Legacy comments wall · signed moment ${i + 1}`
        : c.scope === "news"
          ? `News debate thread · signed moment ${i + 1}`
          : `Fan journey memory · signed moment ${i + 1}`,
  }));
}

function buildHighlights(
  ctx: LegacyJourneyContext,
  ghost: { team: string; name: string }
): string[] {
  const highlights: string[] = [];

  for (const c of ctx.signedComments.slice(-4)) {
    const scope =
      c.scope === "legacy" ? "Legacy wall" : c.scope === "news" ? "News thread" : "Journey";
    highlights.push(`${scope}: you wrote "${c.text.slice(0, 80)}${c.text.length > 80 ? "…" : ""}"`);
  }

  for (const m of ctx.keyMoments.filter((k) => k.type === "match_reaction").slice(-3)) {
    highlights.push(
      `Kickoff felt: ${m.title} — ${m.content.slice(0, 90)}${m.content.length > 90 ? "…" : ""}`
    );
  }

  for (const m of ctx.keyMoments.filter((k) => k.type === "social_reaction").slice(-2)) {
    highlights.push(`Emoji reaction: ${m.title} — ${m.content.slice(0, 80)}`);
  }

  if (highlights.length < 8) {
    highlights.push(
      `${ghost.name} carried ${ghost.team} through ${ctx.stats.totalMoments} indexed chapters`,
      `${ctx.stats.totalEvolutionGain} evolution points earned across the tournament`,
      `${ctx.stats.socialReactions} emoji reactions left on the journey`,
      `${ctx.stats.matchReactions} live kickoffs felt in your skin`
    );
  }

  return highlights.slice(0, 12);
}

/**
 * Labeled offline fallback when live 0G Compute is unavailable or times out.
 */
export function buildLabeledFallbackLegacy(params: {
  ghost: {
    name: string;
    team: string;
    evolutionScore: number;
    mood?: string;
    confidence?: number;
  };
  memories: LegacyMemory[];
  identity?: WalletIdentityProfile;
  journey?: LegacyJourneyContext;
  reason: string;
}): { legacy: LegacyApiOutput; proof: OgComputeProof } {
  const { ghost, memories, identity } = params;
  const journey =
    params.journey ??
    buildLegacyJourneyContext({ memories, identity, ghost });

  const quotes = pickQuote(journey);
  const highlights = buildHighlights(journey, ghost);

  const banterBody = journey.signedComments.length
    ? `You left ${journey.stats.signedComments} signed lines on the wall — ${journey.stats.legacyComments} on Legacy, ${journey.stats.newsComments} in news debates.${quotes.length ? ` The thread still echoes: "${quotes[quotes.length - 1]?.quote}".` : ""} That banter is not background noise. It is how your Spirit learned to speak.`
    : `Your banter chapter is still being written — every signed comment from here will sharpen this legacy.`;

  const matchBeat = journey.keyMoments.find((m) => m.type === "match_reaction");
  const reactionBeat = journey.keyMoments.find((m) => m.type === "social_reaction");

  const identityLine = identity
    ? ` A ${identity.banterStyle.replace(/_/g, " ")} voice with ${identity.reactionPattern.replace(/_/g, " ")} energy — ${identity.journeySignature}.`
    : "";

  const quoteLine = quotes.length
    ? ` Your signed words still echo across the tournament: ${quotes.map((q) => `"${q.quote}"`).join(" · ")}.`
    : "";

  const story = [
    `${ghost.name}'s World Cup was never just scores on a screen. It was ${ghost.team} in the blood, ${journey.stats.totalMoments} evolution chapters deep, and a fan identity that grew louder with every reaction, comment, and heartbreak.${identityLine}`,
    journey.emotionalJourney,
    matchBeat
      ? `On the pitch, you felt it: ${matchBeat.title} — "${matchBeat.content.slice(0, 120)}${matchBeat.content.length > 120 ? "…" : ""}". That moment lives in your indexed journey forever.`
      : `Every kickoff you witness from here will add another line to this story.`,
    reactionBeat
      ? `In the threads, your emoji energy spoke too: ${reactionBeat.title} — "${reactionBeat.content.slice(0, 100)}".`
      : null,
    `${quoteLine} From the first whistle to the final reflection, this legacy belongs on 0G: permanent, wallet-owned (${identity?.walletFingerprint ?? "your wallet"}), and unmistakably yours.`,
    FALLBACK_NARRATIVE_NOTE,
  ]
    .filter(Boolean)
    .join(" ");

  const transformationFrom =
    ghost.evolutionScore >= 50 ? "Hopeful supporter" : "Curious newcomer";
  const transformationTo =
    ghost.evolutionScore >= 80
      ? "Tournament legend"
      : ghost.evolutionScore >= 50
        ? "Veteran voice"
        : "Awakened fan";

  const celebrationMoment =
    journey.keyMoments.find((m) =>
      /euphor|celebrat|victory|goal|win/i.test(`${m.title} ${m.content} ${m.emotionalTone}`)
    ) ?? journey.keyMoments[0];

  const heartbreakMoment =
    journey.keyMoments.find((m) =>
      /loss|heartbreak|deflat|pain|defeat|sad/i.test(`${m.title} ${m.content} ${m.emotionalTone}`)
    ) ?? journey.keyMoments[journey.keyMoments.length - 1];

  return {
    legacy: {
      story,
      highlights,
      transformation: {
        from: transformationFrom,
        to: transformationTo,
        arc: `You arrived carrying ${ghost.team} hope and leave carrying a story shaped by ${journey.stats.signedComments} signed comments, ${journey.stats.matchReactions} kickoffs felt, and ${journey.stats.socialReactions} reactions — only your wallet can prove.`,
      },
      shareText: `My GoalGhost legacy for ${ghost.team} is unwrapped. ${ghost.evolutionScore} evolution · ${journey.stats.signedComments} signed lines · ${journey.stats.totalMoments} chapters · forever on 0G.`,
      dominantMood: ghost.mood ?? (ghost.evolutionScore >= 50 ? "fierce" : "hopeful"),
      emotionalArc: journey.emotionalJourney,
      banterChapter: {
        title: identity
          ? `The ${identity.banterStyle.replace(/_/g, " ")} comments wall`
          : "Your voice on the wall",
        body: banterBody,
      },
      interactionQuotes: quotes,
      wrappedStats: defaultWrappedStats(journey, ghost),
      celebration: {
        title: celebrationMoment?.title ?? highlights[0] ?? "The night everything clicked",
        body: celebrationMoment
          ? `${celebrationMoment.content} This ${ghost.team} moment still glows in your fan journey, sealed as identity evolution on 0G Storage.`
          : `A ${ghost.team} moment that still glows in your fan journey, sealed as identity evolution on 0G Storage.`,
      },
      heartbreak: {
        title: heartbreakMoment?.title ?? "The result that still stings",
        body: heartbreakMoment
          ? `${heartbreakMoment.content} Even when the scoreline hurt, your GoalGhost kept the emotion honest and permanent.`
          : `Even when the scoreline hurt, your GoalGhost kept the emotion honest and permanent.`,
      },
      rivalry: {
        title: `${ghost.team} vs the world`,
        body: `Every debate, every comment thread, every match reaction sharpened who you support and why.${quotes[0] ? ` You said it yourself: "${quotes[0].quote}".` : ""}`,
      },
      fanIdentity: {
        title: identity
          ? `${ghost.name} — ${identity.evolutionArchetype}`
          : `${ghost.name}, forever ${ghost.team}`,
        body: identity
          ? `${identity.personalityPresentation} Conviction at ${ghost.confidence ?? 50}%. This is not a highlight reel — it is your football Spirit, evolved through signed banter, reactions, and match-day feeling, verified on 0G.`
          : `This is not a highlight reel. It is your football identity, evolved through the tournament and verified on 0G.`,
      },
    },
    proof: {
      provider: "goalghost-labeled-fallback",
      chatId: null,
      teeVerified: false,
      fallback: true,
      fallbackReason: params.reason,
    },
  };
}