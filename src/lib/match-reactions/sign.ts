import { verifyMessage } from "viem";
import type { MatchEmojiReactionId } from "./types";

export function buildMatchEmojiReactionMessage(params: {
  address: string;
  tokenId: number;
  matchId: string;
  reactionId: MatchEmojiReactionId;
  createdAt: string;
}): string {
  return [
    "goalghost-match-emoji:v1",
    params.address.toLowerCase(),
    String(params.tokenId),
    params.matchId,
    params.reactionId,
    params.createdAt,
  ].join("\n");
}

export async function verifyMatchEmojiReactionSignature(params: {
  address: string;
  tokenId: number;
  matchId: string;
  reactionId: MatchEmojiReactionId;
  createdAt: string;
  signature: string;
}): Promise<boolean> {
  try {
    return await verifyMessage({
      address: params.address.toLowerCase() as `0x${string}`,
      message: buildMatchEmojiReactionMessage(params),
      signature: params.signature as `0x${string}`,
    });
  } catch {
    return false;
  }
}