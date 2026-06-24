"use client";

import { useMemo, useState } from "react";
import {
  MessageSquareReply,
  Pencil,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommentCompose } from "@/components/comments/comment-compose";
import {
  COMMENTS_INITIAL_VISIBLE,
  COMMENTS_LOAD_MORE_STEP,
} from "@/lib/comments/constants";
import { buildCommentThreads, type ThreadedComment } from "@/lib/comments/build-threads";
import { CommentAttachment } from "@/components/comments/comment-attachment";
import { shortenWalletAddress } from "@/lib/legacy/comment-sign";
import {
  COMMENT_EMOJIS,
  type CommentEmojiId,
  type CommentPostInput,
  type CommentReactions,
  type SocialCommentFields,
} from "@/types/social-comment";
import { hoverEmoji, hoverLoadMore, hoverTextAction } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";

export type WalletCommentBase = {
  id: string;
  commentId: string;
  walletAddress: string;
  text: string;
  createdAt: string;
  updatedAt?: string | null;
} & SocialCommentFields;

function formatCommentTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function isSameWallet(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

const VARIANT_STYLES = {
  compact: {
    article: "rounded-xl border border-white/6 bg-[#0A1020]/50 px-3 py-2.5",
    replyArticle: "rounded-lg border border-white/5 bg-[#0A1020]/40 px-2.5 py-2",
    wallet: "font-mono text-[10px] text-[#F4C542]/85",
    time: "text-[10px] uppercase tracking-wider text-muted/55",
    text: "mt-1.5 text-xs leading-relaxed text-white/88",
    badge: "text-[10px] uppercase tracking-wider text-muted/50",
    actions: "text-[10px]",
    editArea:
      "w-full resize-none rounded-xl border border-white/8 bg-[#0A1020]/60 px-3 py-2 text-xs text-white/90 outline-none focus:border-[#F4C542]/25",
    actionBtn: "h-6 px-2 text-[10px]",
    replyIndent: "ml-4 border-l border-white/8 pl-3",
  },
  full: {
    article: "rounded-2xl border border-white/8 bg-[#0A1020]/60 px-5 py-4",
    replyArticle: "rounded-xl border border-white/6 bg-[#0A1020]/45 px-4 py-3",
    wallet: "font-mono text-xs text-[#F4C542]/85",
    time: "text-[10px] uppercase tracking-wider text-muted/55",
    text: "mt-2 text-sm leading-relaxed text-white/88",
    badge: "text-[10px] uppercase tracking-wider text-muted/50",
    actions: "text-xs",
    editArea:
      "w-full resize-none rounded-2xl border border-white/10 bg-[#0A1020]/70 px-4 py-3 text-sm text-white/90 outline-none focus:border-[#F4C542]/30",
    actionBtn: "h-7 px-2.5 text-xs",
    replyIndent: "ml-5 border-l border-white/8 pl-4",
  },
} as const;

export type CommentVariant = keyof typeof VARIANT_STYLES;

function CommentReactionsBar({
  reactions,
  compact,
  reacting,
  disabled,
  onReact,
}: {
  reactions: CommentReactions;
  compact?: boolean;
  reacting?: CommentEmojiId | null;
  disabled?: boolean;
  onReact: (emojiId: CommentEmojiId) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {COMMENT_EMOJIS.map((emoji) => {
        const count = reactions.counts[emoji.id] ?? 0;
        const selected = reactions.userReaction === emoji.id;
        const busy = reacting === emoji.id;
        return (
          <button
            key={emoji.id}
            type="button"
            disabled={disabled || busy}
            title={emoji.label}
            onClick={() => onReact(emoji.id)}
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5",
              compact ? "text-[10px]" : "text-xs",
              selected
                ? "border-[#F4C542]/55 bg-[#F4C542]/15 text-[#F4C542]"
                : cn(
                    "border-white/8 bg-white/[0.03] text-white/55",
                    hoverEmoji,
                    "hover:text-white/90"
                  ),
              disabled && "cursor-not-allowed opacity-40"
            )}
          >
            <span>{emoji.emoji}</span>
            {count > 0 && <span className="font-medium tabular-nums">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

function WalletCommentRow<T extends WalletCommentBase>({
  comment,
  variant,
  isReply,
  viewerAddress,
  maxLength,
  isConnected,
  editing,
  deleting,
  reactingEmoji,
  onEdit,
  onDelete,
  onReply,
  onReact,
}: {
  comment: T;
  variant: CommentVariant;
  isReply?: boolean;
  viewerAddress?: string;
  maxLength: number;
  isConnected: boolean;
  editing?: boolean;
  deleting?: boolean;
  reactingEmoji?: CommentEmojiId | null;
  onEdit: (comment: T, text: string) => Promise<void>;
  onDelete: (comment: T) => Promise<void>;
  onReply: (comment: T) => void;
  onReact: (comment: T, emojiId: CommentEmojiId) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.text);
  const styles = VARIANT_STYLES[variant];
  const isOwner = isSameWallet(viewerAddress, comment.walletAddress);
  const displayTime = comment.updatedAt ?? comment.createdAt;
  const busy = editing || deleting;

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === comment.text) {
      setIsEditing(false);
      setDraft(comment.text);
      return;
    }
    await onEdit(comment, trimmed);
    setIsEditing(false);
  }

  return (
    <article className={isReply ? styles.replyArticle : styles.article}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className={styles.wallet}>{shortenWalletAddress(comment.walletAddress)}</span>
        <div className="flex items-center gap-2">
          {comment.updatedAt && (
            <span className="text-[10px] text-muted/45">edited</span>
          )}
          <time className={styles.time}>{formatCommentTime(displayTime)}</time>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-2 space-y-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={variant === "compact" ? 2 : 3}
            maxLength={maxLength}
            disabled={busy}
            className={styles.editArea}
          />
          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setDraft(comment.text);
                setIsEditing(false);
              }}
              className={cn(styles.actionBtn, "text-muted/70")}
            >
              <X className="mr-1 h-3 w-3" />
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={busy || !draft.trim()}
              onClick={() => void handleSave()}
              className={styles.actionBtn}
            >
              {editing ? "Signing…" : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <>
          {comment.text && <p className={styles.text}>{comment.text}</p>}
          {comment.mediaRootHash && (
            <CommentAttachment
              mediaRootHash={comment.mediaRootHash}
              mediaType={comment.mediaType}
              mediaUrl={comment.mediaUrl}
              variant={variant}
            />
          )}
        </>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <CommentReactionsBar
          reactions={comment.reactions}
          compact={variant === "compact"}
          reacting={reactingEmoji}
          disabled={!isConnected}
          onReact={(emojiId) => void onReact(comment, emojiId)}
        />
        <div className={cn("flex items-center gap-1", styles.actions)}>
          {isConnected && !isEditing && (
            <button
              type="button"
              onClick={() => onReply(comment)}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-muted/60",
                hoverTextAction,
                "hover:text-[#F4C542]/90"
              )}
            >
              <MessageSquareReply className="h-3 w-3" />
              Reply
            </button>
          )}
          {isOwner && !isEditing && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setDraft(comment.text);
                  setIsEditing(true);
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-muted/60",
                  hoverTextAction,
                  "hover:text-[#F4C542]/90 disabled:opacity-50"
                )}
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void onDelete(comment)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-muted/60",
                  hoverTextAction,
                  "hover:text-red-300/90 disabled:opacity-50"
                )}
              >
                <Trash2 className="h-3 w-3" />
                {deleting ? "…" : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={cn("mt-2 flex items-center gap-1.5", styles.badge)}>
        <ShieldCheck className="h-3 w-3 text-[#F4C542]/60" />
        Wallet-signed · 0G Storage
      </div>
    </article>
  );
}

function CommentThread<T extends WalletCommentBase>({
  thread,
  variant,
  viewerAddress,
  maxLength,
  isConnected,
  editingId,
  deletingId,
  reactingCommentId,
  reactingEmoji,
  onEdit,
  onDelete,
  onReply,
  onReact,
}: {
  thread: ThreadedComment<T>;
  variant: CommentVariant;
  viewerAddress?: string;
  maxLength: number;
  isConnected: boolean;
  editingId?: string | null;
  deletingId?: string | null;
  reactingCommentId?: string | null;
  reactingEmoji?: CommentEmojiId | null;
  onEdit: (comment: T, text: string) => Promise<void>;
  onDelete: (comment: T) => Promise<void>;
  onReply: (comment: T) => void;
  onReact: (comment: T, emojiId: CommentEmojiId) => Promise<void>;
}) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div className="space-y-2">
      <WalletCommentRow
        comment={thread}
        variant={variant}
        viewerAddress={viewerAddress}
        maxLength={maxLength}
        isConnected={isConnected}
        editing={editingId === thread.id}
        deleting={deletingId === thread.id}
        reactingEmoji={
          reactingCommentId === thread.id ? reactingEmoji : null
        }
        onEdit={onEdit}
        onDelete={onDelete}
        onReply={onReply}
        onReact={onReact}
      />
      {thread.replies.length > 0 && (
        <div className={cn("space-y-2", styles.replyIndent)}>
          {thread.replies.map((reply) => (
            <WalletCommentRow
              key={reply.id}
              comment={reply}
              variant={variant}
              isReply
              viewerAddress={viewerAddress}
              maxLength={maxLength}
              isConnected={isConnected}
              editing={editingId === reply.id}
              deleting={deletingId === reply.id}
              reactingEmoji={
                reactingCommentId === reply.id ? reactingEmoji : null
              }
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
              onReact={onReact}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function WalletCommentList<T extends WalletCommentBase>({
  comments,
  variant,
  viewerAddress,
  maxLength,
  isConnected,
  editingId,
  deletingId,
  reactingCommentId,
  reactingEmoji,
  onEdit,
  onDelete,
  onReply,
  onReact,
  className,
}: {
  comments: T[];
  variant: CommentVariant;
  viewerAddress?: string;
  maxLength: number;
  isConnected: boolean;
  editingId?: string | null;
  deletingId?: string | null;
  reactingCommentId?: string | null;
  reactingEmoji?: CommentEmojiId | null;
  onEdit: (comment: T, text: string) => Promise<void>;
  onDelete: (comment: T) => Promise<void>;
  onReply: (comment: T) => void;
  onReact: (comment: T, emojiId: CommentEmojiId) => Promise<void>;
  className?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(COMMENTS_INITIAL_VISIBLE);
  const threads = useMemo(() => buildCommentThreads(comments), [comments]);
  const visible = threads.slice(0, visibleCount);
  const hasMore = threads.length > visibleCount;

  if (threads.length === 0) return null;

  return (
    <div className={cn("space-y-2", variant === "full" && "space-y-3", className)}>
      {visible.map((thread) => (
        <CommentThread
          key={thread.commentId}
          thread={thread}
          variant={variant}
          viewerAddress={viewerAddress}
          maxLength={maxLength}
          isConnected={isConnected}
          editingId={editingId}
          deletingId={deletingId}
          reactingCommentId={reactingCommentId}
          reactingEmoji={reactingEmoji}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
          onReact={onReact}
        />
      ))}
      {hasMore && (
        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              setVisibleCount((n) =>
                Math.min(n + COMMENTS_LOAD_MORE_STEP, threads.length)
              )
            }
            className={cn(
              "text-muted/70",
              hoverLoadMore,
              variant === "compact" && "h-7 text-[10px]"
            )}
          >
            Show More ({threads.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}

export function WalletCommentSection<T extends WalletCommentBase>({
  comments,
  variant,
  viewerAddress,
  maxLength,
  isConnected,
  posting,
  editingId,
  deletingId,
  reactingCommentId,
  reactingEmoji,
  error,
  replyTo,
  composePlaceholder,
  onPost,
  onCancelReply,
  onEdit,
  onDelete,
  onReply,
  onReact,
}: {
  comments: T[];
  variant: CommentVariant;
  viewerAddress?: string;
  maxLength: number;
  isConnected: boolean;
  posting: boolean;
  editingId?: string | null;
  deletingId?: string | null;
  reactingCommentId?: string | null;
  reactingEmoji?: CommentEmojiId | null;
  error: string | null;
  replyTo?: T | null;
  composePlaceholder: string;
  onPost: (input: CommentPostInput) => Promise<void>;
  onCancelReply?: () => void;
  onEdit: (comment: T, text: string) => Promise<void>;
  onDelete: (comment: T) => Promise<void>;
  onReply: (comment: T) => void;
  onReact: (comment: T, emojiId: CommentEmojiId) => Promise<void>;
}) {
  return (
    <>
      <WalletCommentList
        comments={comments}
        variant={variant}
        viewerAddress={viewerAddress}
        maxLength={maxLength}
        isConnected={isConnected}
        editingId={editingId}
        deletingId={deletingId}
        reactingCommentId={reactingCommentId}
        reactingEmoji={reactingEmoji}
        onEdit={onEdit}
        onDelete={onDelete}
        onReply={onReply}
        onReact={onReact}
      />
      <div className={comments.length > 0 ? "mt-3" : undefined}>
        <CommentCompose
          placeholder={composePlaceholder}
          maxLength={maxLength}
          posting={posting}
          compact={variant === "compact"}
          replyTo={
            replyTo ? shortenWalletAddress(replyTo.walletAddress) : null
          }
          onCancelReply={onCancelReply}
          onSubmit={onPost}
        />
        {error && (
          <p
            className={cn(
              "mt-2 text-red-300/90",
              variant === "compact" ? "text-[10px]" : "text-xs"
            )}
          >
            {error}
          </p>
        )}
        {!isConnected && (
          <p
            className={cn(
              "mt-2 text-muted/55",
              variant === "compact" ? "text-[10px]" : "text-sm"
            )}
          >
            Connect your wallet to sign and post.
          </p>
        )}
      </div>
    </>
  );
}