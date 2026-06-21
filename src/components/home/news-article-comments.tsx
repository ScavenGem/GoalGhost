"use client";

import { WalletCommentSection } from "@/components/comments/wallet-comments";
import { NEWS_COMMENT_MAX_LENGTH } from "@/lib/news/comment-sign";
import type { NewsComment } from "@/types/news-comment";
import type { CommentEmojiId, CommentPostInput } from "@/types/social-comment";

export function NewsArticleComments({
  articleId,
  comments,
  isConnected,
  viewerAddress,
  posting,
  editingCommentId,
  deletingCommentId,
  reactingCommentId,
  reactingEmoji,
  replyTo,
  error,
  onPost,
  onEdit,
  onDelete,
  onReply,
  onReact,
  onCancelReply,
}: {
  articleId: string;
  comments: NewsComment[];
  isConnected: boolean;
  viewerAddress?: string;
  posting: boolean;
  editingCommentId?: string | null;
  deletingCommentId?: string | null;
  reactingCommentId?: string | null;
  reactingEmoji?: CommentEmojiId | null;
  replyTo?: NewsComment | null;
  error: string | null;
  onPost: (articleId: string, input: CommentPostInput) => Promise<void>;
  onEdit: (comment: NewsComment, text: string) => Promise<void>;
  onDelete: (comment: NewsComment) => Promise<void>;
  onReply: (comment: NewsComment) => void;
  onReact: (comment: NewsComment, emojiId: CommentEmojiId) => Promise<void>;
  onCancelReply: () => void;
}) {
  return (
    <div
      className="border-t border-white/6 px-5 pb-4 pt-3"
      onClick={(e) => e.stopPropagation()}
    >
      <WalletCommentSection
        comments={comments}
        variant="compact"
        viewerAddress={viewerAddress}
        maxLength={NEWS_COMMENT_MAX_LENGTH}
        isConnected={isConnected}
        posting={posting}
        editingId={editingCommentId}
        deletingId={deletingCommentId}
        reactingCommentId={reactingCommentId}
        reactingEmoji={reactingEmoji}
        error={error}
        replyTo={replyTo}
        composePlaceholder="Add a signed comment…"
        onPost={(input) => onPost(articleId, input)}
        onCancelReply={onCancelReply}
        onEdit={onEdit}
        onDelete={onDelete}
        onReply={onReply}
        onReact={onReact}
      />
    </div>
  );
}