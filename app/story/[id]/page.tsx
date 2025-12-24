'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowUpRight,
  MessageSquare,
  TrendingUp,
  Clock,
  User,
  Coffee,
  ExternalLink,
  Newspaper,
  Github,
} from 'lucide-react';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

function SourceIcon({ type }: { type: string }) {
  switch (type) {
    case 'hackernews':
      return (
        <span className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
          Y
        </span>
      );
    case 'rss':
      return <Newspaper className="w-4 h-4 text-teal-500" />;
    case 'github':
      return <Github className="w-4 h-4" />;
    default:
      return <span className="w-2 h-2 rounded-full bg-teal-500" />;
  }
}

function StoryContent({ id }: { id: string }) {
  const item = useQuery(api.functions.items.getById, {
    id: id as Id<"items">,
  });

  if (item === undefined) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <Separator className="my-8" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  if (item === null) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Story Not Found
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            This story may have been removed or doesn't exist.
          </p>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to all stories
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const sourceType = item.source?.type || 'hackernews';
  const sourceName = item.source?.name || 'Unknown';

  return (
    <>
      {/* Back navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to all stories
        </Link>
      </div>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <article>
          {/* Hero section */}
          <header className="mb-10">
            {/* Importance badge for high-scoring items */}
            {item.importanceScore >= 70 && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 text-white text-sm font-bold shadow-lg shadow-teal-500/25">
                  <TrendingUp className="w-4 h-4" />
                  High Impact Story
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight mb-6">
              {item.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {item.author && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {item.author}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatRelativeTime(new Date(item.publishedAt))}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <SourceIcon type={sourceType} />
                {sourceName}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-sm font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </header>

          <Separator className="my-8" />

          {/* Stats section */}
          <section className="grid grid-cols-2 gap-4 mb-10">
            {item.score !== undefined && item.score > 0 && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/30 dark:to-emerald-950/30 border border-teal-100 dark:border-teal-900/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {sourceType === 'github' ? 'Stars' : 'Score'}
                  </span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatNumber(item.score)}
                </p>
              </div>
            )}
            {item.commentsCount !== undefined && item.commentsCount > 0 && (
              <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    {sourceType === 'github' ? 'Forks' : 'Comments'}
                  </span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatNumber(item.commentsCount)}
                </p>
              </div>
            )}
          </section>

          {/* Action buttons */}
          <section className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-600 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/25 font-semibold"
            >
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Original Article
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            {item.commentsUrl && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex-1 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
              >
                <a
                  href={item.commentsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  View Discussion
                  <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
                </a>
              </Button>
            )}
          </section>
        </article>
      </main>
    </>
  );
}

export default function StoryPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  AI News Without Burnout
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Stay informed, not overwhelmed
                </p>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <StoryContent id={id} />

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Curated AI news from multiple sources. Your time matters.
          </p>
        </div>
      </footer>
    </div>
  );
}
