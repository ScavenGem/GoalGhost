import type { SocialCommentFields } from "@/types/social-comment";

export type LegacyCommentDocument = {
  version: 2;
  type: "legacy_comment";
  commentId: string;
  walletAddress: string;
  text: string;
  signature: string;
  createdAt: string;
  parentCommentId?: string | null;
  mediaRootHash?: string | null;
  mediaType?: string | null;
};

export type LegacyComment = {
  id: string;
  commentId: string;
  walletAddress: string;
  text: string;
  signature: string;
  rootHash: string;
  createdAt: string;
  updatedAt?: string | null;
} & SocialCommentFields;

export type LegacyCommentsResult = {
  comments: LegacyComment[];
  fetchedAt: string;
};