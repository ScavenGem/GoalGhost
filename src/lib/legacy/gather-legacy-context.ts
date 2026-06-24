import type { GhostApiRecord } from "@/hooks/use-ghost";
import type { GhostMemory } from "@/lib/legacy/build-legacy";

type CommentRow = {
  walletAddress?: string;
  text?: string;
  createdAt?: string;
};

function toMemory(
  title: string,
  content: string,
  type: string,
  occurredAt?: string
): GhostMemory {
  return { title, content, type, occurredAt };
}

function ownComments(
  comments: CommentRow[] | undefined,
  wallet: string,
  type: string,
  limit = 6
): GhostMemory[] {
  if (!comments?.length) return [];
  return comments
    .filter((c) => c.walletAddress?.toLowerCase() === wallet)
    .slice(0, limit)
    .map((c) =>
      toMemory(
        `${type} moment`,
        c.text?.trim() ?? "",
        type,
        c.createdAt
      )
    )
    .filter((m) => (m.content?.length ?? 0) > 0);
}

/** Enrich legacy generation with memories, comments, and evolution chapters. */
export async function gatherLegacyMemories(
  walletAddress: string,
  ghost: GhostApiRecord
): Promise<GhostMemory[]> {
  const wallet = walletAddress.toLowerCase();
  const base: GhostMemory[] = (ghost.memories ?? []).map((m) => ({
    title: m.title,
    content: m.content,
    type: m.type,
    emotionalTone: m.emotionalTone,
    occurredAt: m.occurredAt,
  }));

  const [legacyRes, newsRes] = await Promise.all([
    fetch(`/api/legacy/comments?wallet=${wallet}`, { cache: "no-store" }).catch(
      () => null
    ),
    fetch(`/api/news/comments?wallet=${wallet}`, { cache: "no-store" }).catch(
      () => null
    ),
  ]);

  const extras: GhostMemory[] = [];

  if (legacyRes?.ok) {
    const data = (await legacyRes.json()) as { comments?: CommentRow[] };
    extras.push(...ownComments(data.comments, wallet, "legacy_comment"));
  }

  if (newsRes?.ok) {
    const data = (await newsRes.json()) as { comments?: CommentRow[] };
    extras.push(...ownComments(data.comments, wallet, "news_comment"));
  }

  extras.unshift(
    toMemory(
      "Nation carried",
      `${ghost.name} carries ${ghost.team} through the World Cup`,
      "fan_identity"
    )
  );

  return [...base, ...extras];
}