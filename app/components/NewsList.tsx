'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexNewsItem } from '@/types/news';
import { NewsCard } from './NewsCard';
import { NewsListSkeleton } from './NewsCardSkeleton';
import { AlertCircle, Newspaper } from 'lucide-react';

export function NewsList() {
  const feedResult = useQuery(api.functions.items.getFeed, { limit: 30 });
  const stats = useQuery(api.functions.items.getStats);

  // Loading state
  if (feedResult === undefined) {
    return <NewsListSkeleton />;
  }

  // Error state - Convex queries don't throw, but we can check for empty data
  // If there's a Convex connection issue, feedResult would be undefined longer

  // Empty state
  if (!feedResult.items || feedResult.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Newspaper className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          You're all caught up
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
          No new updates right now. Take a break — we'll have fresh news soon.
        </p>
      </div>
    );
  }

  const items = feedResult.items as ConvexNewsItem[];
  const sourceCount = stats?.sources?.length ?? 1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {items.length} articles from {sourceCount} source
            {sourceCount !== 1 ? 's' : ''}
          </p>
        </div>
        {/* Real-time updates - no refresh button needed */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live updates
        </div>
      </div>

      {/* Articles list */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <NewsCard
            key={item._id}
            article={{
              id: item._id,
              title: item.title,
              url: item.url,
              source: item.source?.type ?? 'hackernews',
              sourceId: item.externalId,
              publishedAt: new Date(item.publishedAt),
              author: item.author,
              score: item.score,
              commentsCount: item.commentsCount,
              commentsUrl: item.commentsUrl,
              tags: item.tags,
            }}
            index={index}
          />
        ))}
      </div>

      {/* Show if there are more items */}
      {feedResult.hasMore && (
        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            More stories available...
          </p>
        </div>
      )}
    </div>
  );
}
