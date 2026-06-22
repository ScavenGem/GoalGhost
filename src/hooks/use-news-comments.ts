"use client";

import { useCallback, useMemo, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import { applyOptimisticCommentReaction } from "@/lib/comments/reaction-optimistic";
import { buildCommentReactionMessage } from "@/lib/comments/reaction-sign";
import { uploadCommentMedia } from "@/lib/comments/upload-media";
import {
  buildNewsCommentDeleteMessage,
  buildNewsCommentEditMessage,
  buildNewsCommentMessage,
  NEWS_COMMENT_MAX_LENGTH,
} from "@/lib/news/comment-sign";
import {
  EMPTY_COMMENT_REACTION_COUNTS,
  type CommentEmojiId,
  type CommentPostInput,
} from "@/types/social-comment";
import type { NewsComment, NewsCommentsResult } from "@/types/news-comment";

export const NEWS_COMMENTS_QUERY_KEY = "news-comments";

async function fetchNewsComments(
  articleIds: string[],
  wallet?: string
): Promise<NewsCommentsResult> {
  const params = new URLSearchParams({
    articleIds: articleIds.join(","),
  });
  if (wallet) params.set("wallet", wallet.toLowerCase());
  const res = await fetch(`/api/news/comments?${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Comments unavailable");
  return res.json();
}

export function useNewsComments(articleIds: string[]) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [replyToByArticle, setReplyToByArticle] = useState<
    Record<string, NewsComment | null>
  >({});

  const idsKey = useMemo(
    () => [...articleIds].sort().join(","),
    [articleIds]
  );

  const walletKey = address?.toLowerCase() ?? "";

  const query = useQuery({
    queryKey: [NEWS_COMMENTS_QUERY_KEY, idsKey, walletKey],
    queryFn: () => fetchNewsComments(articleIds, address),
    enabled: articleIds.length > 0,
    staleTime: 15_000,
    gcTime: 30 * 60_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });

  const commentsByArticle = useMemo(() => {
    const map = new Map<string, NewsComment[]>();
    for (const comment of query.data?.comments ?? []) {
      const list = map.get(comment.articleId) ?? [];
      list.push(comment);
      map.set(comment.articleId, list);
    }
    return map;
  }, [query.data?.comments]);

  const updateCache = useCallback(
    (updater: (comments: NewsComment[]) => NewsComment[]) => {
      queryClient.setQueryData<NewsCommentsResult>(
        [NEWS_COMMENTS_QUERY_KEY, idsKey, walletKey],
        (old) => ({
          comments: updater(old?.comments ?? []),
          fetchedAt: new Date().toISOString(),
        })
      );
    },
    [queryClient, idsKey, walletKey]
  );

  function normalizeComment(comment: NewsComment): NewsComment {
    return {
      ...comment,
      reactions: comment.reactions ?? {
        counts: { ...EMPTY_COMMENT_REACTION_COUNTS },
        userReaction: null,
      },
    };
  }

  function formatPostError(err: Error): string {
    const msg = err.message.toLowerCase();
    if (msg.includes("user rejected") || msg.includes("denied") || msg.includes("cancel")) {
      return "Wallet signature cancelled";
    }
    return err.message;
  }

  const postMutation = useMutation({
    mutationFn: async ({
      articleId,
      input,
      parentCommentId,
    }: {
      articleId: string;
      input: CommentPostInput;
      parentCommentId?: string | null;
    }) => {
      if (!address || !isConnected) {
        throw new Error("Connect your wallet to comment");
      }

      const trimmed = input.text.trim();
      let mediaRootHash: string | null = null;
      let mediaType: string | null = null;

      if (input.mediaFile) {
        const uploaded = await uploadCommentMedia(input.mediaFile);
        mediaRootHash = uploaded.mediaRootHash;
        mediaType = uploaded.mediaType;
      }

      if (!trimmed && !mediaRootHash) {
        throw new Error("Add text or an image");
      }
      if (trimmed.length > NEWS_COMMENT_MAX_LENGTH) {
        throw new Error(`Comment must be ${NEWS_COMMENT_MAX_LENGTH} characters or fewer`);
      }

      const createdAt = new Date().toISOString();
      const commentId = `news-comment-${Date.now()}-${address.slice(2, 8)}`;
      const message = buildNewsCommentMessage({
        address,
        articleId,
        text: trimmed,
        createdAt,
        parentCommentId: parentCommentId ?? null,
        mediaRootHash,
      });

      const signature = await signMessageAsync({ message });

      const res = await fetch("/api/news/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          articleId,
          walletAddress: address,
          text: trimmed,
          signature,
          createdAt,
          parentCommentId: parentCommentId ?? null,
          mediaRootHash,
          mediaType,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to post comment");
      }

      return res.json() as Promise<{ comment: NewsComment }>;
    },
    onSuccess: (data, vars) => {
      setError(null);
      const comment = normalizeComment(data.comment);
      updateCache((existing) => [
        comment,
        ...existing.filter((c) => c.id !== comment.id),
      ]);
      setReplyToByArticle((prev) => ({ ...prev, [vars.articleId]: null }));
      void queryClient.invalidateQueries({
        queryKey: [NEWS_COMMENTS_QUERY_KEY, idsKey],
      });
    },
    onError: (err: Error) => setError(formatPostError(err)),
  });

  const editMutation = useMutation({
    mutationFn: async ({ comment, text }: { comment: NewsComment; text: string }) => {
      if (!address || !isConnected) throw new Error("Connect your wallet to edit");
      const trimmed = text.trim();
      if (!trimmed) throw new Error("Comment cannot be empty");
      const updatedAt = new Date().toISOString();
      const message = buildNewsCommentEditMessage({
        address,
        commentId: comment.commentId,
        articleId: comment.articleId,
        text: trimmed,
        updatedAt,
      });
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/news/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.commentId,
          articleId: comment.articleId,
          walletAddress: address,
          text: trimmed,
          signature,
          updatedAt,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to edit comment");
      }
      return res.json() as Promise<{ comment: NewsComment }>;
    },
    onSuccess: (data) => {
      setError(null);
      const comment = data.comment;
      updateCache((existing) =>
        existing.map((c) => (c.id === comment.id ? { ...comment, reactions: c.reactions } : c))
      );
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (comment: NewsComment) => {
      if (!address || !isConnected) throw new Error("Connect your wallet to delete");
      const deletedAt = new Date().toISOString();
      const message = buildNewsCommentDeleteMessage({
        address,
        commentId: comment.commentId,
        articleId: comment.articleId,
        deletedAt,
      });
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/news/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.commentId,
          articleId: comment.articleId,
          walletAddress: address,
          signature,
          deletedAt,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to delete comment");
      }
      return comment;
    },
    onSuccess: (comment) => {
      setError(null);
      updateCache((existing) => existing.filter((c) => c.id !== comment.id));
    },
    onError: (err: Error) => setError(err.message),
  });

  const reactMutation = useMutation({
    mutationFn: async ({
      comment,
      emojiId,
    }: {
      comment: NewsComment;
      emojiId: CommentEmojiId;
    }) => {
      if (!address || !isConnected) throw new Error("Connect your wallet to react");
      const createdAt = new Date().toISOString();
      const message = buildCommentReactionMessage({
        scope: "news",
        commentId: comment.commentId,
        emojiId,
        address,
        createdAt,
      });
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/news/comments/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.commentId,
          walletAddress: address,
          emojiId,
          signature,
          createdAt,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to react");
      }
      return res.json() as Promise<{
        commentId: string;
        reactions: NewsComment["reactions"];
      }>;
    },
    onMutate: ({ comment, emojiId }) => {
      const previous = comment.reactions;
      const optimistic = applyOptimisticCommentReaction(previous, emojiId);
      updateCache((existing) =>
        existing.map((c) =>
          c.id === comment.id ? { ...c, reactions: optimistic } : c
        )
      );
      return { comment, previous };
    },
    onSuccess: (data) => {
      setError(null);
      updateCache((existing) =>
        existing.map((c) =>
          c.commentId === data.commentId
            ? { ...c, reactions: data.reactions }
            : c
        )
      );
    },
    onError: (err: Error, _vars, ctx) => {
      setError(err.message);
      if (ctx?.comment && ctx.previous) {
        updateCache((existing) =>
          existing.map((c) =>
            c.id === ctx.comment.id ? { ...c, reactions: ctx.previous } : c
          )
        );
      }
    },
  });

  const postComment = useCallback(
    async (articleId: string, input: CommentPostInput) => {
      setError(null);
      const parent = replyToByArticle[articleId];
      await postMutation.mutateAsync({
        articleId,
        input,
        parentCommentId: parent?.commentId ?? null,
      });
    },
    [postMutation, replyToByArticle]
  );

  const setReplyTo = useCallback((articleId: string, comment: NewsComment | null) => {
    setReplyToByArticle((prev) => ({ ...prev, [articleId]: comment }));
  }, []);

  const editComment = useCallback(
    async (comment: NewsComment, text: string) => {
      setError(null);
      await editMutation.mutateAsync({ comment, text });
    },
    [editMutation]
  );

  const deleteComment = useCallback(
    async (comment: NewsComment) => {
      setError(null);
      await deleteMutation.mutateAsync(comment);
    },
    [deleteMutation]
  );

  const reactToComment = useCallback(
    async (comment: NewsComment, emojiId: CommentEmojiId) => {
      setError(null);
      await reactMutation.mutateAsync({ comment, emojiId });
    },
    [reactMutation]
  );

  const postingArticleId = postMutation.isPending
    ? (postMutation.variables?.articleId ?? null)
    : null;

  return {
    commentsByArticle,
    loading: query.isLoading && !query.data,
    posting: postMutation.isPending,
    postingArticleId,
    editingCommentId: editMutation.isPending
      ? (editMutation.variables?.comment.id ?? null)
      : null,
    deletingCommentId: deleteMutation.isPending
      ? (deleteMutation.variables?.id ?? null)
      : null,
    reactingCommentId: reactMutation.isPending
      ? (reactMutation.variables?.comment.id ?? null)
      : null,
    reactingEmoji: reactMutation.isPending
      ? (reactMutation.variables?.emojiId ?? null)
      : null,
    replyToByArticle,
    error,
    isConnected,
    address,
    postComment,
    editComment,
    deleteComment,
    reactToComment,
    setReplyTo,
  };
}