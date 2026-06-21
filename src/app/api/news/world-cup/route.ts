import { NextResponse } from "next/server";
import { fetchWorldCupNews } from "@/lib/news/client";
import { NEWS_CACHE_TTL_MS } from "@/lib/news/news-cache";

export const dynamic = "force-dynamic";

export async function GET() {
  const feed = await fetchWorldCupNews();
  const maxAge = Math.floor(NEWS_CACHE_TTL_MS / 1000);

  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": `private, max-age=${maxAge}, stale-while-revalidate=${maxAge}`,
    },
  });
}