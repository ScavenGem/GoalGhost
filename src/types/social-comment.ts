export type CommentEmojiId =
  | "fire"
  | "heart"
  | "football"
  | "sad"
  | "celebration";

export type CommentReactionCounts = Record<CommentEmojiId, number>;

export type CommentReactions = {
  counts: CommentReactionCounts;
  userReaction: CommentEmojiId | null;
};

export const EMPTY_COMMENT_REACTION_COUNTS: CommentReactionCounts = {
  fire: 0,
  heart: 0,
  football: 0,
  sad: 0,
  celebration: 0,
};

export const COMMENT_EMOJIS: { id: CommentEmojiId; emoji: string; label: string }[] = [
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "heart", emoji: "❤️", label: "Love" },
  { id: "football", emoji: "⚽", label: "Football" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "celebration", emoji: "🎉", label: "Celebration" },
];

export type CommentMediaType = "image" | "gif";

export type SocialCommentFields = {
  parentCommentId?: string | null;
  mediaRootHash?: string | null;
  mediaType?: CommentMediaType | null;
  reactions: CommentReactions;
};

export type CommentPostInput = {
  text: string;
  parentCommentId?: string | null;
  mediaFile?: File | null;
};