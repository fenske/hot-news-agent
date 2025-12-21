import { getStoryById, getNews } from '@/lib/services/news';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowUpRight,
  MessageSquare,
  TrendingUp,
  Clock,
  User,
  Zap,
  ExternalLink,
} from 'lucide-react';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const news = await getNews();
  return news.articles.slice(0, 20).map((article) => ({
    id: article.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const article = await getStoryById(id);
  if (!article) return { title: 'Story Not Found' };
  return {
    title: `${article.title} | Hot AI News`,
    description: article.excerpt || `Read more about: ${article.title}`,
  };
}

export default async function StoryPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getStoryById(id);

  if (!article) {
    notFound();
  }

  const news = await getNews();
  const storyIndex = news.articles.findIndex((a) => a.id === article.id);
  const isTopStory = storyIndex >= 0 && storyIndex < 3;

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  Hot AI News
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Trending discussions and stories
                </p>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Back navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors group"
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
            {/* Rank badge for top stories */}
            {isTopStory && (
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold shadow-lg shadow-orange-500/25">
                  <TrendingUp className="w-4 h-4" />
                  #{storyIndex + 1} Trending Story
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight mb-6">
              {article.title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
              {article.author && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    {article.author}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{formatRelativeTime(new Date(article.publishedAt))}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                {article.source === 'hackernews' ? 'Hacker News' : article.source}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
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
            {article.score !== undefined && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-100 dark:border-orange-900/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Score
                  </span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatNumber(article.score)}
                </p>
              </div>
            )}
            {article.commentsCount !== undefined && (
              <div className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Comments
                  </span>
                </div>
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  {formatNumber(article.commentsCount)}
                </p>
              </div>
            )}
          </section>

          {/* Excerpt section */}
          {article.excerpt && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
                Overview
              </h2>
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50">
                <p className="text-lg text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </section>
          )}

          {/* Action buttons */}
          <section className="flex flex-col sm:flex-row gap-4">
            <Button
              asChild
              size="lg"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 font-semibold"
            >
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Original Article
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            {article.commentsUrl && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="flex-1 border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-semibold"
              >
                <a
                  href={article.commentsUrl}
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

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Powered by Hacker News API. Content curated for AI-related topics.
          </p>
        </div>
      </footer>
    </div>
  );
}
