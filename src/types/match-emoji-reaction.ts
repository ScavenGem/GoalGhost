import type { MatchEmojiReactionId } from "@/lib/match-reactions/types";

export type MatchEmojiReactionCounts = Record<MatchEmojiReactionId, number>;

export type MatchEmojiReactionSummary = {
  counts: MatchEmojiReactionCounts;
  userReaction: MatchEmojiReactionId | null;
};

export type MatchEmojiReactionsResult = {
  matches: Record<string, MatchEmojiReactionSummary>;
  fetchedAt: string;
};

export const EMPTY_EMOJI_COUNTS: MatchEmojiReactionCounts = {
  excited: 0,
  love: 0,
  great_play: 0,
  heartbreak: 0,
  celebration: 0,
};