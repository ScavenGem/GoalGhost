export type MatchEmojiReactionId =
  | "excited"
  | "great_play"
  | "heartbreak"
  | "celebration";

export type MatchEmojiReaction = {
  id: MatchEmojiReactionId;
  emoji: string;
  label: string;
};

export const MATCH_EMOJI_REACTIONS: MatchEmojiReaction[] = [
  { id: "excited", emoji: "🔥", label: "Excited" },
  { id: "great_play", emoji: "⚽", label: "Great Play" },
  { id: "heartbreak", emoji: "😢", label: "Heartbreak" },
  { id: "celebration", emoji: "🎉", label: "Celebration" },
];