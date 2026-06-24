import type { GhostApiRecord } from "@/hooks/use-ghost";

type CommentRow = {
  walletAddress?: string;
  text?: string;
};

function memoryLine(
  memory: NonNullable<GhostApiRecord["memories"]>[number]
): string | null {
  const line = [memory.type, memory.title, memory.content]
    .filter(Boolean)
    .join(": ");
  return line.length > 0 ? line : null;
}

function ownComments(
  comments: CommentRow[] | undefined,
  wallet: string,
  label: string,
  limit = 8
): string[] {
  if (!comments?.length) return [];
  return comments
    .filter((c) => c.walletAddress?.toLowerCase() === wallet)
    .slice(0, limit)
    .map((c) => c.text?.trim())
    .filter((text): text is string => !!text)
    .map((text) => `${label}: ${text}`);
}

/** Collect match memories, legacy comments, and news comments for evolve prompts. */
export async function gatherEvolveContext(
  walletAddress: string,
  ghost: GhostApiRecord
): Promise<string[]> {
  const wallet = walletAddress.toLowerCase();
  const lines: string[] = [];

  for (const memory of (ghost.memories ?? []).slice(-10)) {
    const line = memoryLine(memory);
    if (line) lines.push(line);
  }

  const [legacyRes, newsRes] = await Promise.all([
    fetch(`/api/legacy/comments?wallet=${wallet}`, { cache: "no-store" }).catch(
      () => null
    ),
    fetch(`/api/news/comments?wallet=${wallet}`, { cache: "no-store" }).catch(
      () => null
    ),
  ]);

  if (legacyRes?.ok) {
    const data = (await legacyRes.json()) as { comments?: CommentRow[] };
    lines.push(...ownComments(data.comments, wallet, "legacy comment"));
  }

  if (newsRes?.ok) {
    const data = (await newsRes.json()) as { comments?: CommentRow[] };
    lines.push(...ownComments(data.comments, wallet, "news comment"));
  }

  return lines.length > 0
    ? lines
    : ["No evolution chapters yet — still becoming."];
}