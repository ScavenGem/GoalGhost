"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "@/lib/motion";
import { ChevronDown, ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import { useWorldCupNews } from "@/hooks/use-world-cup-news";
import { useNewsComments } from "@/hooks/use-news-comments";
import { NewsArticleComments } from "@/components/home/news-article-comments";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { Button } from "@/components/ui/button";
import type { NewsArticle } from "@/types/news";
import type { NewsComment } from "@/types/news-comment";
import type { CommentEmojiId, CommentPostInput } from "@/types/social-comment";
import { hoverCardSubtle, hoverEase, hoverIconBtn, hoverLoadMore } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";

const DEFAULT_VISIBLE = 6;

function formatPublishedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const NewsArticleCard = memo(function NewsArticleCard({
  article,
  index,
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
  article: NewsArticle;
  index: number;
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
  const articleComments = comments ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.5 }}
      className={cn(
        "overflow-hidden rounded-2xl border border-white/8 bg-[#0A1020]/75",
        hoverCardSubtle
      )}
    >
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full border border-[#F4C542]/20 bg-[#F4C542]/8 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[#F4C542]/85">
            {article.source}
          </span>
          <ExternalLink className={cn("h-3.5 w-3.5 shrink-0 text-muted/40", hoverEase, "group-hover:scale-110 group-hover:text-[#F4C542]/70")} />
        </div>
        <h3 className={cn("mt-3 font-display text-lg leading-snug text-white/92", hoverEase, "group-hover:text-[#F4C542]")}>
          {article.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted/85 line-clamp-3">
          {article.summary}
        </p>
        <p className="mt-3 text-[10px] uppercase tracking-wider text-muted/55">
          {formatPublishedAt(article.publishedAt)}
        </p>
      </a>

      <NewsArticleComments
        articleId={article.id}
        comments={articleComments}
        isConnected={isConnected}
        viewerAddress={viewerAddress}
        posting={posting}
        editingCommentId={editingCommentId}
        deletingCommentId={deletingCommentId}
        reactingCommentId={reactingCommentId}
        reactingEmoji={reactingEmoji}
        replyTo={replyTo}
        error={error}
        onPost={onPost}
        onEdit={onEdit}
        onDelete={onDelete}
        onReply={onReply}
        onReact={onReact}
        onCancelReply={onCancelReply}
      />
    </motion.div>
  );
});

function NewsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-white/6 bg-[#0A1020]/50 p-5"
        >
          <div className="h-4 w-24 rounded-full bg-white/8" />
          <div className="mt-4 h-5 w-full rounded bg-white/8" />
          <div className="mt-2 h-5 w-4/5 rounded bg-white/6" />
          <div className="mt-4 h-3 w-20 rounded bg-white/6" />
        </div>
      ))}
    </div>
  );
}

export function HomeWorldCupNews() {
  const [showAll, setShowAll] = useState(false);
  const { articles, configured, stale, fetchedAt, loading, refreshing, refresh } =
    useWorldCupNews();

  const visibleArticles = useMemo(
    () => (showAll ? articles : articles.slice(0, DEFAULT_VISIBLE)),
    [articles, showAll]
  );

  const allArticleIds = useMemo(() => articles.map((a) => a.id), [articles]);

  const {
    commentsByArticle,
    isConnected,
    address,
    postComment,
    editComment,
    deleteComment,
    reactToComment,
    setReplyTo,
    replyToByArticle,
    postingArticleId,
    postErrorArticleId,
    editingCommentId,
    deletingCommentId,
    reactingCommentId,
    reactingEmoji,
    error,
  } = useNewsComments(allArticleIds);

  const hasMore = articles.length > DEFAULT_VISIBLE;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-[#F4C542]/20 bg-[#F4C542]/8">
            <Newspaper className="h-4 w-4 text-[#F4C542]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
              FIFA World Cup
            </p>
            <h2 className="mt-1 font-display text-xl text-white/90 md:text-2xl">
              World Cup News
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stale && (
            <span className="text-[10px] text-muted/60">cached feed</span>
          )}
          {fetchedAt && (
            <span className="hidden text-[10px] text-muted/60 sm:inline">
              Updated {new Date(fetchedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => void refresh()}
            className={cn("text-muted", hoverIconBtn, "hover:text-[#F4C542]")}
            aria-label="Refresh news"
          >
            {refreshing ? (
              <GoalGhostLogo size={14} spin />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <NewsSkeleton />
      ) : !configured || articles.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-[#0A1020]/50 px-6 py-10 text-center">
          <p className="text-sm text-muted/80">
            No World Cup headlines right now. Check back after the next briefing.
          </p>
        </div>
      ) : (
        <>
          <div
            className={cn(
              "grid gap-4",
              visibleArticles.length >= 5
                ? "sm:grid-cols-2 lg:grid-cols-3"
                : "sm:grid-cols-2"
            )}
          >
            {visibleArticles.map((article, index) => (
              <NewsArticleCard
                key={article.id}
                article={article}
                index={index}
                comments={commentsByArticle.get(article.id) ?? []}
                isConnected={isConnected}
                viewerAddress={address}
                posting={postingArticleId === article.id}
                editingCommentId={editingCommentId}
                deletingCommentId={deletingCommentId}
                reactingCommentId={reactingCommentId}
                reactingEmoji={reactingEmoji}
                replyTo={replyToByArticle[article.id] ?? null}
                error={
                  error &&
                  (postingArticleId === article.id ||
                    postErrorArticleId === article.id ||
                    (commentsByArticle.get(article.id) ?? []).some(
                      (c) =>
                        c.id === editingCommentId ||
                        c.id === deletingCommentId ||
                        c.id === reactingCommentId
                    ))
                    ? error
                    : null
                }
                onPost={postComment}
                onEdit={editComment}
                onDelete={deleteComment}
                onReply={(comment) => setReplyTo(article.id, comment)}
                onReact={reactToComment}
                onCancelReply={() => setReplyTo(article.id, null)}
              />
            ))}
          </div>

          {hasMore && !showAll && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(true)}
                className={cn(
                  "border-[#F4C542]/25 text-[#F4C542]/90",
                  hoverLoadMore,
                  "hover:bg-[#F4C542]/10"
                )}
              >
                <ChevronDown className="mr-1.5 h-3.5 w-3.5" />
                See More News
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
}