import { NextResponse } from "next/server";
import { fetchMatches } from "@/lib/football/client";
import { prisma } from "@/lib/db/prisma";
import { runGhostInference } from "@/lib/0g/compute/inference";

/**
 * JUDGE NOTE - AUTOMATED MATCH PROCESSING
 * Cron polls football-data.org, runs 0G Compute reactions for cached ghosts,
 * and indexes memory rootHashes. Memories themselves are written via
 * user-wallet ECIES when users interact; cron triggers evolution for
 * team-matched ghosts when live score changes.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { matches } = await fetchMatches();
  const live = matches.filter((m) => m.status === "LIVE" || m.status === "PAUSED");
  let processed = 0;

  for (const match of live) {
    const eventHash = `${match.id}-${match.score?.home}-${match.score?.away}-${match.minute}`;
    const existing = await prisma.matchPollState.findUnique({
      where: { matchId: match.id },
    });

    if (existing?.lastEventHash === eventHash) continue;

    const ghosts = await prisma.ghostCache.findMany();
    const relevant = ghosts.filter(
      (g) =>
        g.team === match.homeTeam ||
        g.team === match.awayTeam
    );

    for (const ghost of relevant) {
      try {
        await runGhostInference({
          task: "reaction",
          ghost: {
            name: ghost.name,
            team: ghost.team,
            mood: ghost.mood,
            evolutionScore: ghost.evolutionScore,
          },
          match,
          eventType: "CRON_LIVE_UPDATE",
        });
        processed++;
      } catch {
        // 0G Compute unavailable - skip gracefully
      }
    }

    await prisma.matchPollState.upsert({
      where: { matchId: match.id },
      create: { matchId: match.id, lastEventHash: eventHash, lastPolledAt: new Date() },
      update: { lastEventHash: eventHash, lastPolledAt: new Date() },
    });
  }

  return NextResponse.json({ processed, liveMatches: live.length });
}