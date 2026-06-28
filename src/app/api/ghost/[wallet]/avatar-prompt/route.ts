import { NextResponse } from "next/server";
import { getGhostByWallet } from "@/lib/cache/ghost-cache";
import { buildGhostAvatarImagePrompt } from "@/lib/ghost/avatar-prompt";

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

  const prompt = buildGhostAvatarImagePrompt({
    country: ghost.team,
    team: ghost.team,
    name: ghost.name,
    walletAddress: wallet,
    traits: ghost.traits ?? undefined,
    mood: ghost.mood,
    evolutionScore: ghost.evolutionScore,
    confidence: ghost.confidence,
    memories: ghost.memories.map((m) => ({
      type: m.type,
      title: m.title ?? undefined,
      content: m.content ?? undefined,
      emotionalTone: m.emotionalTone ?? undefined,
      evolutionDelta: m.evolutionDelta ?? undefined,
    })),
  });

  return NextResponse.json({
    prompt,
    evolutionScore: ghost.evolutionScore,
    confidence: ghost.confidence,
    mood: ghost.mood,
    stage: ghost.evolutionScore >= 80 ? "Legend" : ghost.evolutionScore >= 50 ? "Veteran" : ghost.evolutionScore >= 25 ? "Awakened" : ghost.evolutionScore > 0 ? "Growing" : "Newborn",
  });
}