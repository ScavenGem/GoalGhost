import type { FootballMatch } from "@/types/match";
import type { MatchEmojiReactionId } from "./types";
import { formatLiveMinute } from "@/lib/football/status";

type GhostContext = {
  name: string;
  team: string;
  mood: string;
};

type EmojiMemoryPayload = {
  title: string;
  content: string;
  emotionalTone: string;
  evolutionDelta: number;
};

function scoreLine(match: FootballMatch): string {
  if (!match.score) return `${match.homeTeam} vs ${match.awayTeam}`;
  return `${match.homeTeam} ${match.score.home}-${match.score.away} ${match.awayTeam}`;
}

function minuteContext(match: FootballMatch): string {
  if (match.minute == null) return "";
  return ` at ${formatLiveMinute(match.minute, match.injuryTime)}`;
}

export function buildEmojiReactionMemory(
  reactionId: MatchEmojiReactionId,
  match: FootballMatch,
  ghost: GhostContext
): EmojiMemoryPayload {
  const teamIn =
    ghost.team === match.homeTeam || ghost.team === match.awayTeam;
  const score = scoreLine(match);
  const minute = minuteContext(match);
  const isLive = match.status === "LIVE" || match.status === "PAUSED";
  const isFinished = match.status === "FINISHED";

  switch (reactionId) {
    case "excited":
      return {
        title: teamIn ? "Electric on the pitch" : "Caught in the current",
        content: teamIn
          ? isLive
            ? `${ghost.name} is buzzing${minute}: ${score}. Every touch from ${ghost.team} sends a jolt through me.`
            : isFinished
              ? `Still buzzing after ${score}. ${ghost.name} cannot shake the charge of that ${ghost.team} night.`
              : `${ghost.name} is already restless for ${score}. The wait for ${ghost.team} is unbearable.`
          : isLive
            ? `${ghost.name} leans in${minute} watching ${score}. Not my nation, but the fire of the game pulls me in.`
            : `${ghost.name} felt the crackle around ${score}. Football always finds a way to excite me.`,
        emotionalTone: "charged",
        evolutionDelta: isLive ? 4 : 3,
      };
    case "love":
      return {
        title: teamIn ? "Love for my nation" : "Love for the game",
        content: teamIn
          ? `${ghost.name} pours love into ${score}${minute}. ${ghost.team} means everything in this moment.`
          : `${ghost.name} feels the love around ${score}${minute}. Football at its most human.`,
        emotionalTone: "tender",
        evolutionDelta: 3,
      };
    case "great_play":
      return {
        title: teamIn ? "That move lives in me" : "Beautiful football",
        content: teamIn
          ? `${ghost.name} savors the craft${minute} in ${score}. ${ghost.team} played something worth sealing forever.`
          : `${ghost.name} nods at the quality${minute} in ${score}. Skill is its own language, and I speak it fluently.`,
        emotionalTone: "captivated",
        evolutionDelta: 3,
      };
    case "heartbreak":
      return {
        title: teamIn ? "Gutted for my nation" : "The sting of football",
        content: teamIn
          ? isLive
            ? `${ghost.name} feels the floor drop${minute}: ${score}. Every ${ghost.team} heartbeat hurts right now.`
            : isFinished
              ? `${ghost.name} carries the ache of ${score}. That final whistle left a mark on ${ghost.team} and on me.`
              : `${ghost.name} dreads what ${score} might become. Hope and fear are the same coin for ${ghost.team}.`
          : `${ghost.name} winces at ${score}${minute}. Even from the shadows, heartbreak travels fast.`,
        emotionalTone: "deflated",
        evolutionDelta: isLive || isFinished ? 5 : 3,
      };
    case "celebration":
      return {
        title: teamIn ? "Pure joy for my nation" : "A moment worth roaring for",
        content: teamIn
          ? `${ghost.name} erupts${minute} with ${score}. ${ghost.team} gave me something to celebrate and etch on 0G.`
          : `${ghost.name} joins the noise around ${score}${minute}. Celebration is contagious, even for a ghost.`,
        emotionalTone: "euphoric",
        evolutionDelta: 5,
      };
  }
}