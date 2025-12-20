import { NewsArticle, NewsResponse } from '@/types/news';
import { fetchAINews } from './hackernews';

const cache = new Map<string, { data: NewsResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getNews(forceRefresh = false): Promise<NewsResponse> {
  const cacheKey = 'news:all';
  const cached = cache.get(cacheKey);

  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const sources: NewsResponse['sources'] = [];
  let articles: NewsArticle[] = [];

  try {
    const hnArticles = await fetchAINews();
    articles = hnArticles;
    sources.push({
      name: 'HackerNews',
      status: 'success',
      count: hnArticles.length,
    });
  } catch (error) {
    console.error('Failed to fetch HackerNews:', error);
    sources.push({
      name: 'HackerNews',
      status: 'error',
      count: 0,
    });
  }

  // Sort by score (descending), then by date (newest first)
  articles.sort((a, b) => {
    const scoreA = a.score || 0;
    const scoreB = b.score || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const response: NewsResponse = {
    articles,
    lastUpdated: new Date(),
    sources,
  };

  cache.set(cacheKey, { data: response, timestamp: Date.now() });

  return response;
}

export function clearCache(): void {
  cache.clear();
}
