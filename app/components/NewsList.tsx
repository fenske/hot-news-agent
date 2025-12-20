'use client';

import { useState, useEffect, useCallback } from 'react';
import { NewsResponse } from '@/types/news';
import { NewsCard } from './NewsCard';
import { NewsListSkeleton } from './NewsCardSkeleton';
import { RefreshButton } from './RefreshButton';
import { Button } from '@/components/ui/button';
import { AlertCircle, Newspaper } from 'lucide-react';

interface NewsListProps {
  initialData?: NewsResponse;
}

export function NewsList({ initialData }: NewsListProps) {
  const [data, setData] = useState<NewsResponse | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/news${forceRefresh ? '?refresh=true' : ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const newsData: NewsResponse = await response.json();
      setData({
        ...newsData,
        lastUpdated: new Date(newsData.lastUpdated),
        articles: newsData.articles.map((a) => ({
          ...a,
          publishedAt: new Date(a.publishedAt),
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchNews();
    }
  }, [fetchNews, initialData]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  if (isLoading) {
    return <NewsListSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Failed to load news
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 text-center max-w-md">
          {error}
        </p>
        <Button onClick={() => fetchNews()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  if (!data || data.articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Newspaper className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          No AI news found
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
          Check back later for the latest AI news, interviews, and discussions.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {data.articles.length} articles from {data.sources.length} source
            {data.sources.length !== 1 ? 's' : ''}
          </p>
        </div>
        <RefreshButton
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={data.lastUpdated}
        />
      </div>

      {/* Source status */}
      {data.sources.some((s) => s.status === 'error') && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Some sources are temporarily unavailable. Showing partial results.
          </p>
        </div>
      )}

      {/* Articles list */}
      <div className="space-y-3">
        {data.articles.map((article, index) => (
          <NewsCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </div>
  );
}
