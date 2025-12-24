'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { ConvexNewsItem } from '@/types/news';
import { NewsCard } from './NewsCard';
import { NewsListSkeleton } from './NewsCardSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, TrendingUp, Clock, Flame } from 'lucide-react';

function NewsItems({ items }: { items: ConvexNewsItem[] }) {
  if (items.length === 0) {
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

  return (
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
  );
}

function TopStoriesTab() {
  const feedResult = useQuery(api.functions.items.getFeed, { limit: 30 });

  if (feedResult === undefined) {
    return <NewsListSkeleton />;
  }

  return <NewsItems items={feedResult.items as ConvexNewsItem[]} />;
}

function TrendingTab() {
  const trending = useQuery(api.functions.items.getTrending, { limit: 15 });

  if (trending === undefined) {
    return <NewsListSkeleton />;
  }

  const items = trending as ConvexNewsItem[];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Flame className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Nothing trending yet
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md">
          Check back soon to see what's gaining traction.
        </p>
      </div>
    );
  }

  return <NewsItems items={items} />;
}

function RecentTab() {
  const recent = useQuery(api.functions.items.getRecent, { limit: 30, hoursAgo: 24 });

  if (recent === undefined) {
    return <NewsListSkeleton />;
  }

  return <NewsItems items={recent as ConvexNewsItem[]} />;
}

export function NewsFeed() {
  const stats = useQuery(api.functions.items.getStats);
  const sourceCount = stats?.sources?.length ?? 0;
  const itemCount = stats?.itemsLast24h ?? 0;

  return (
    <div>
      {/* Stats header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {itemCount > 0
              ? `${itemCount} articles in the last 24h from ${sourceCount} source${sourceCount !== 1 ? 's' : ''}`
              : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live updates
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="top" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="top" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Top Stories</span>
            <span className="sm:hidden">Top</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <Flame className="w-4 h-4" />
            <span className="hidden sm:inline">Trending</span>
            <span className="sm:hidden">Hot</span>
          </TabsTrigger>
          <TabsTrigger value="recent" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Recent</span>
            <span className="sm:hidden">New</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="top">
          <TopStoriesTab />
        </TabsContent>

        <TabsContent value="trending">
          <TrendingTab />
        </TabsContent>

        <TabsContent value="recent">
          <RecentTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
