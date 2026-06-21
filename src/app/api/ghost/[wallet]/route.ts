import { NextResponse } from "next/server";
import { getGhostByWallet } from "@/lib/cache/ghost-cache";

const GHOST_CACHE_MAX_AGE = 45;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  const { wallet } = await params;
  const ghost = await getGhostByWallet(wallet);
  if (!ghost) {
    return NextResponse.json({ ghost: null }, { status: 404 });
  }
  return NextResponse.json(
    { ghost },
    {
      headers: {
        "Cache-Control": `private, max-age=${GHOST_CACHE_MAX_AGE}, stale-while-revalidate=${GHOST_CACHE_MAX_AGE}`,
      },
    }
  );
}