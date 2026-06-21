export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  imageUrl?: string;
};

export type NewsFeedResult = {
  articles: NewsArticle[];
  fetchedAt: string;
  stale?: boolean;
  configured: boolean;
};