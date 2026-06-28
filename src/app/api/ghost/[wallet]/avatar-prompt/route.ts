import { NextResponse } from "next/server";
import { getGhostByWallet } from "@/lib/cache/ghost-cache";
import { buildGhostAvatarImagePrompt } from "@/lib/ghost/avatar-prompt";
import { analyzeWalletIdentity } from "@/lib/ghost/identity-distinctness";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await params;
  const ghost = await getGhostByWallet(wallet);

  if (!ghost) {
    return NextResponse.json({ error: "Ghost not found" }, { status: 404 });
  }

  const memories = ghost.memories.map((m) => ({
    type: m.type,
    title: m.title ?? undefined,
    content: m.content ?? undefined,
    emotionalTone: m.emotionalTone ?? undefined,
    evolutionDelta: m.evolutionDelta ?? undefined,
  }));

  const commentSignals = memories
    .filter(
      (m) =>
        m.type === "social_comment" ||
        m.type === "legacy_comment" ||
        m.type === "news_comment"
    )
    .map((m) => ({
      text: m.content?.trim() ?? "",
      scope:
        m.type === "news_comment"
          ? ("news" as const)
          : m.type === "legacy_comment"
            ? ("legacy" as const)
            : undefined,
      hasMedia: /visual|gif|image|media/i.test(`${m.title} ${m.content}`),
    }))
    .filter((c) => c.text.length > 0);

  const identity = analyzeWalletIdentity({
    walletAddress: wallet,
    traits: ghost.traits ?? undefined,
    mood: ghost.mood,
    evolutionScore: ghost.evolutionScore,
    confidence: ghost.confidence,
    memories,
    comments: commentSignals,
  });

  const prompt = buildGhostAvatarImagePrompt({
    country: ghost.team,
    team: ghost.team,
    name: ghost.name,
    walletAddress: wallet,
    traits: ghost.traits ?? undefined,
    mood: ghost.mood,
    evolutionScore: ghost.evolutionScore,
    confidence: ghost.confidence,
    memories,
    identity,
  });

  return NextResponse.json({
    prompt,
    evolutionScore: ghost.evolutionScore,
    confidence: ghost.confidence,
    mood: ghost.mood,
    stage: ghost.evolutionScore >= 80 ? "Legend" : ghost.evolutionScore >= 50 ? "Veteran" : ghost.evolutionScore >= 25 ? "Awakened" : ghost.evolutionScore > 0 ? "Growing" : "Newborn",
  });
}