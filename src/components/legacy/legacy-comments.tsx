"use client";

import { MessageSquare } from "lucide-react";
import { FootballLoader } from "@/components/ui/football-loader";
import { WalletCommentSection } from "@/components/comments/wallet-comments";
import { LEGACY_COMMENT_MAX_LENGTH } from "@/lib/legacy/comment-sign";
import { useLegacyComments } from "@/hooks/use-legacy-comments";

export function LegacyComments() {
  const {
    comments,
    loading,
    posting,
    editingCommentId,
    deletingCommentId,
    reactingCommentId,
    reactingEmoji,
    replyTo,
    error,
    isConnected,
    address,
    postComment,
    editComment,
    deleteComment,
    reactToComment,
    setReplyTo,
  } = useLegacyComments();

  return (
    <section className="space-y-6 border-t border-white/6 pt-10">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-[#F4C542]/20 bg-[#F4C542]/8">
          <MessageSquare className="h-4 w-4 text-[#F4C542]" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
            Decentralized wall
          </p>
          <h2 className="mt-1 font-display text-xl text-white/90 md:text-2xl">
            Legacy Comments
          </h2>
          <p className="mt-1 max-w-lg text-sm text-muted/80">
            Leave a signed note on the wall. Reply, react, and attach images. All
            verified by your wallet and stored as identity evolution data on 0G Storage.
          </p>
        </div>
      </div>

      {loading && comments.length === 0 ? (
        <FootballLoader label="Loading comments…" />
      ) : (
        <WalletCommentSection
          comments={comments}
          variant="full"
          viewerAddress={address}
          maxLength={LEGACY_COMMENT_MAX_LENGTH}
          isConnected={isConnected}
          posting={posting}
          editingId={editingCommentId}
          deletingId={deletingCommentId}
          reactingCommentId={reactingCommentId}
          reactingEmoji={reactingEmoji}
          error={error}
          replyTo={replyTo}
          composePlaceholder="Share your tournament take…"
          onPost={postComment}
          onCancelReply={() => setReplyTo(null)}
          onEdit={editComment}
          onDelete={deleteComment}
          onReply={setReplyTo}
          onReact={reactToComment}
        />
      )}

      {comments.length === 0 && !loading && (
        <p className="text-center text-sm text-muted/70">
          {isConnected
            ? "Be the first to leave a signed comment on the wall."
            : "No comments yet. Connect your wallet to be the first to sign the wall."}
        </p>
      )}
    </section>
  );
}