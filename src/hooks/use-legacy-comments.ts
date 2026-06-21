"use client";

import { useCallback, useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useSignMessage } from "wagmi";
import { applyOptimisticCommentReaction } from "@/lib/comments/reaction-optimistic";
import { buildCommentReactionMessage } from "@/lib/comments/reaction-sign";
import { uploadCommentMedia } from "@/lib/comments/upload-media";
import {
  buildLegacyCommentDeleteMessage,
  buildLegacyCommentEditMessage,
  buildLegacyCommentMessage,
  LEGACY_COMMENT_MAX_LENGTH,
} from "@/lib/legacy/comment-sign";
import type {
  LegacyComment,
  LegacyCommentsResult,
} from "@/types/legacy-comment";
import type { CommentEmojiId, CommentPostInput } from "@/types/social-comment";

export const LEGACY_COMMENTS_QUERY_KEY = ["legacy-comments"] as const;

async function fetchLegacyComments(wallet?: string): Promise<LegacyCommentsResult> {
  const params = new URLSearchParams();
  if (wallet) params.set("wallet", wallet.toLowerCase());
  const qs = params.toString();
  const res = await fetch(`/api/legacy/comments${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Comments unavailable");
  return res.json();
}

export function useLegacyComments() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<LegacyComment | null>(null);

  const query = useQuery({
    queryKey: LEGACY_COMMENTS_QUERY_KEY,
    queryFn: () => fetchLegacyComments(address),
    staleTime: 15_000,
    gcTime: 30 * 60_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: LEGACY_COMMENTS_QUERY_KEY });
  }, [address, queryClient]);

  const updateCache = useCallback(
    (updater: (comments: LegacyComment[]) => LegacyComment[]) => {
      queryClient.setQueryData<LegacyCommentsResult>(
        LEGACY_COMMENTS_QUERY_KEY,
        (old) => ({
          comments: updater(old?.comments ?? []),
          fetchedAt: new Date().toISOString(),
        })
      );
    },
    [queryClient]
  );

  const postMutation = useMutation({
    mutationFn: async (input: CommentPostInput) => {
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
      if (trimmed.length > LEGACY_COMMENT_MAX_LENGTH) {
        throw new Error(`Comment must be ${LEGACY_COMMENT_MAX_LENGTH} characters or fewer`);
      }

      const createdAt = new Date().toISOString();
      const commentId = `legacy-comment-${Date.now()}-${address.slice(2, 8)}`;
      const message = buildLegacyCommentMessage({
        address,
        text: trimmed,
        createdAt,
        parentCommentId: replyTo?.commentId ?? null,
        mediaRootHash,
      });

      const signature = await signMessageAsync({ message });

      const res = await fetch("/api/legacy/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          walletAddress: address,
          text: trimmed,
          signature,
          createdAt,
          parentCommentId: replyTo?.commentId ?? null,
          mediaRootHash,
          mediaType,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Failed to post comment");
      }

      return res.json() as Promise<{ comment: LegacyComment }>;
    },
    onSuccess: (data) => {
      setError(null);
      const comment = data.comment;
      updateCache((existing) => [
        comment,
        ...existing.filter((c) => c.id !== comment.id),
      ]);
      setReplyTo(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const editMutation = useMutation({
    mutationFn: async ({ comment, text }: { comment: LegacyComment; text: string }) => {
      if (!address || !isConnected) throw new Error("Connect your wallet to edit");
      const trimmed = text.trim();
      if (!trimmed) throw new Error("Comment cannot be empty");
      const updatedAt = new Date().toISOString();
      const message = buildLegacyCommentEditMessage({
        address,
        commentId: comment.commentId,
        text: trimmed,
        updatedAt,
      });
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/legacy/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.commentId,
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
      return res.json() as Promise<{ comment: LegacyComment }>;
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
    mutationFn: async (comment: LegacyComment) => {
      if (!address || !isConnected) throw new Error("Connect your wallet to delete");
      const deletedAt = new Date().toISOString();
      const message = buildLegacyCommentDeleteMessage({
        address,
        commentId: comment.commentId,
        deletedAt,
      });
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/legacy/comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.commentId,
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
      comment: LegacyComment;
      emojiId: CommentEmojiId;
    }) => {
      if (!address || !isConnected) throw new Error("Connect your wallet to react");
      const createdAt = new Date().toISOString();
      const message = buildCommentReactionMessage({
        scope: "legacy",
        commentId: comment.commentId,
        emojiId,
        address,
        createdAt,
      });
      const signature = await signMessageAsync({ message });
      const res = await fetch("/api/legacy/comments/reactions", {
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
        reactions: LegacyComment["reactions"];
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
    async (input: CommentPostInput) => {
      setError(null);
      await postMutation.mutateAsync(input);
    },
    [postMutation]
  );

  const editComment = useCallback(
    async (comment: LegacyComment, text: string) => {
      setError(null);
      await editMutation.mutateAsync({ comment, text });
    },
    [editMutation]
  );

  const deleteComment = useCallback(
    async (comment: LegacyComment) => {
      setError(null);
      await deleteMutation.mutateAsync(comment);
    },
    [deleteMutation]
  );

  const reactToComment = useCallback(
    async (comment: LegacyComment, emojiId: CommentEmojiId) => {
      setError(null);
      await reactMutation.mutateAsync({ comment, emojiId });
    },
    [reactMutation]
  );

  return {
    comments: query.data?.comments ?? [],
    loading: query.isLoading && !query.data,
    posting: postMutation.isPending,
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
    replyTo,
    error,
    isConnected,
    address,
    postComment,
    editComment,
    deleteComment,
    reactToComment,
    setReplyTo,
    refresh: () => query.refetch(),
  };
}