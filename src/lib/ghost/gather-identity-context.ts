import type { GhostApiRecord } from "@/hooks/use-ghost";
import {
  analyzeWalletIdentity,
  type CommentSignal,
  type WalletIdentityProfile,
} from "@/lib/ghost/identity-distinctness";
import type { GhostMemorySnapshot } from "@/lib/ghost/avatar-visual-profile";

type CommentRow = {
  walletAddress?: string;
  text?: string;
  mediaRootHash?: string | null;
  mediaType?: string | null;
};

function ownCommentSignals(
  comments: CommentRow[] | undefined,
  wallet: string,
  scope: "legacy" | "news"
): CommentSignal[] {
  if (!comments?.length) return [];
  return comments
    .filter((c) => c.walletAddress?.toLowerCase() === wallet)
    .map((c) => ({
      text: c.text?.trim() ?? "",
      scope,
      hasMedia: !!c.mediaRootHash,
    }))
    .filter((c) => c.text.length > 0);
}

function toMemorySnapshots(
  memories: GhostApiRecord["memories"]
): GhostMemorySnapshot[] {
  return (memories ?? []).map((m) => ({
    type: m.type,
    title: m.title,
    content: m.content,
    emotionalTone: m.emotionalTone,
    evolutionDelta: m.evolutionDelta,
  }));
}

export type IdentityContext = {
  identity: WalletIdentityProfile;
  commentSignals: CommentSignal[];
  memorySnapshots: GhostMemorySnapshot[];
};

/** Client-side: fetch comments and build wallet-specific identity profile. */
export async function gatherIdentityContext(
  walletAddress: string,
  ghost: GhostApiRecord
): Promise<IdentityContext> {
  const wallet = walletAddress.toLowerCase();
  const memorySnapshots = toMemorySnapshots(ghost.memories);

  const [legacyRes, newsRes] = await Promise.all([
    fetch(`/api/legacy/comments?wallet=${wallet}`, { cache: "no-store" }).catch(
      () => null
    ),
    fetch(`/api/news/comments?wallet=${wallet}`, { cache: "no-store" }).catch(
      () => null
    ),
  ]);

  const commentSignals: CommentSignal[] = [];

  if (legacyRes?.ok) {
    const data = (await legacyRes.json()) as { comments?: CommentRow[] };
    commentSignals.push(...ownCommentSignals(data.comments, wallet, "legacy"));
  }

  if (newsRes?.ok) {
    const data = (await newsRes.json()) as { comments?: CommentRow[] };
    commentSignals.push(...ownCommentSignals(data.comments, wallet, "news"));
  }

  const identity = analyzeWalletIdentity({
    walletAddress: wallet,
    traits: ghost.traits ?? undefined,
    mood: ghost.mood,
    evolutionScore: ghost.evolutionScore,
    confidence: ghost.confidence,
    memories: memorySnapshots,
    comments: commentSignals,
  });

  return { identity, commentSignals, memorySnapshots };
}