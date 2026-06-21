import type { SocialCommentFields } from "@/types/social-comment";

export type NewsCommentDocument = {
  version: 2;
  type: "news_comment";
  commentId: string;
  articleId: string;
  walletAddress: string;
  text: string;
  signature: string;
  createdAt: string;
  parentCommentId?: string | null;
  mediaRootHash?: string | null;
  mediaType?: string | null;
};

export type NewsComment = {
  id: string;
  commentId: string;
  articleId: string;
  walletAddress: string;
  text: string;
  signature: string;
  rootHash: string;
  createdAt: string;
  updatedAt?: string | null;
} & SocialCommentFields;

export type NewsCommentsResult = {
  comments: NewsComment[];
  fetchedAt: string;
};