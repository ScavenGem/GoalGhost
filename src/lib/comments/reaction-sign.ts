import { verifyMessage } from "viem";
import type { CommentEmojiId } from "@/types/social-comment";

export type CommentScope = "news" | "legacy";

export function buildCommentReactionMessage(params: {
  scope: CommentScope;
  commentId: string;
  emojiId: CommentEmojiId;
  address: string;
  createdAt: string;
}): string {
  return [
    "goalghost-comment-reaction:v1",
    params.scope,
    params.commentId,
    params.emojiId,
    params.address.toLowerCase(),
    params.createdAt,
  ].join("\n");
}

export async function verifyCommentReactionSignature(params: {
  scope: CommentScope;
  commentId: string;
  emojiId: CommentEmojiId;
  address: string;
  createdAt: string;
  signature: string;
}): Promise<boolean> {
  try {
    return await verifyMessage({
      address: params.address.toLowerCase() as `0x${string}`,
      message: buildCommentReactionMessage(params),
      signature: params.signature as `0x${string}`,
    });
  } catch {
    return false;
  }
}