import type { CommentEmojiId, CommentReactions } from "@/types/social-comment";

export function applyOptimisticCommentReaction(
  current: CommentReactions,
  emojiId: CommentEmojiId
): CommentReactions {
  const counts = { ...current.counts };
  const previous = current.userReaction;

  if (previous === emojiId) {
    counts[emojiId] = Math.max(0, counts[emojiId] - 1);
    return { counts, userReaction: null };
  }

  if (previous) {
    counts[previous] = Math.max(0, counts[previous] - 1);
  }

  counts[emojiId] += 1;
  return { counts, userReaction: emojiId };
}