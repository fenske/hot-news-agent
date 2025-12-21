'use client';

import Link from 'next/link';
import { NewsArticle } from '@/types/news';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { ArrowUpRight, MessageSquare, TrendingUp, Clock, User, ChevronRight } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

export function NewsCard({ article, index }: NewsCardProps) {
  const isTopStory = index < 3;

  return (
    <Link href={`/story/${article.id}`} className="block">
      <Card
        className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-0 cursor-pointer ${
          isTopStory
            ? 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20'
            : 'bg-white dark:bg-zinc-900'
        }`}
      >
        {isTopStory && (
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-amber-500" />
        )}

        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            {/* Rank indicator */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isTopStory
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              {index + 1}
            </div>

            <div className="flex-1 min-w-0">
              {/* Title */}
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                {article.title}
              </h2>

              {/* Excerpt preview */}
              {article.excerpt && (
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {article.excerpt}
                </p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                {article.score !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-orange-500" />
                    <span className="font-medium">{formatNumber(article.score)}</span>
                  </div>
                )}

                {article.commentsCount !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>{formatNumber(article.commentsCount)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{formatRelativeTime(new Date(article.publishedAt))}</span>
                </div>

                {article.author && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span className="truncate max-w-[100px]">{article.author}</span>
                  </div>
                )}
              </div>

              {/* Bottom row: source + read more */}
              <div className="flex items-center justify-between mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {article.source === 'hackernews' ? 'Hacker News' : article.source}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read overview
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
