import { NextResponse } from "next/server";
import { fetchMatches } from "@/lib/football/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const feed = await fetchMatches();
  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}