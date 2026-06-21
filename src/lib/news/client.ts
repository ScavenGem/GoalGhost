import type { NewsArticle, NewsFeedResult } from "@/types/news";
import { newsCache, NEWS_CACHE_TTL_MS } from "@/lib/news/news-cache";

const NEWS_QUERY = '"World Cup 2026" OR "FIFA World Cup"';
const PLACEHOLDER_KEYS = new Set([
  "",
  "your_newsapi_key_here",
  "your_news_api_key_here",
]);

type NewsApiArticle = {
  source?: { name?: string };
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
};

type NewsApiResponse = {
  status: string;
  articles?: NewsApiArticle[];
  message?: string;
};

function isConfiguredKey(key: string | undefined): boolean {
  if (!key) return false;
  return !PLACEHOLDER_KEYS.has(key.trim().toLowerCase());
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function toArticle(raw: NewsApiArticle, index: number): NewsArticle | null {
  const title = raw.title?.trim();
  const url = raw.url?.trim();
  if (!title || !url) return null;

  const summary =
    raw.description?.trim() ||
    (raw.content ? truncate(raw.content.replace(/\[\+\d+ chars\]$/, "").trim(), 160) : "");

  if (!summary) return null;

  return {
    id: `${url}-${index}`,
    title,
    summary: truncate(summary, 160),
    source: raw.source?.name?.trim() || "News",
    url,
    publishedAt: raw.publishedAt ?? new Date().toISOString(),
    imageUrl: raw.urlToImage?.trim() || undefined,
  };
}

async function fetchFromNewsApi(apiKey: string): Promise<NewsArticle[]> {
  const url = new URL("https://newsapi.org/v2/everything");
  url.searchParams.set("q", NEWS_QUERY);
  url.searchParams.set("language", "en");
  url.searchParams.set("sortBy", "publishedAt");
  url.searchParams.set("pageSize", "20");

  const res = await fetch(url.toString(), {
    headers: { "X-Api-Key": apiKey },
    next: { revalidate: Math.floor(NEWS_CACHE_TTL_MS / 1000) },
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as NewsApiResponse | null;
    throw new Error(err?.message ?? `NewsAPI error ${res.status}`);
  }

  const data = (await res.json()) as NewsApiResponse;
  if (data.status !== "ok" || !data.articles?.length) return [];

  return data.articles
    .map((article, index) => toArticle(article, index))
    .filter((article): article is NewsArticle => article !== null)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export async function fetchWorldCupNews(): Promise<NewsFeedResult> {
  const apiKey = process.env.NEXT_PUBLIC_NEWS_API_KEY;
  const configured = isConfiguredKey(apiKey);
  const fetchedAt = new Date().toISOString();

  if (!configured) {
    return { articles: [], fetchedAt, configured: false };
  }

  if (newsCache.isFresh()) {
    const cached = newsCache.get();
    if (cached) {
      return cached.result;
    }
  }

  try {
    const articles = await fetchFromNewsApi(apiKey!);
    const result: NewsFeedResult = { articles, fetchedAt, configured: true };
    newsCache.set(result);
    return result;
  } catch (error) {
    console.error("World Cup news fetch failed:", error);
    const cached = newsCache.get();
    if (cached) {
      return { ...cached.result, stale: true };
    }
    return { articles: [], fetchedAt, configured: true };
  }
}