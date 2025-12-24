'use client';

import { NewsArticle } from '@/types/news';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatNumber } from '@/lib/utils';
import { ArrowUpRight, MessageSquare, TrendingUp, Clock, User, Newspaper, Github } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  index: number;
}

export function NewsCard({ article, index }: NewsCardProps) {
  const isTopStory = index < 3;

  return (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border-0 ${
        isTopStory
          ? 'bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20'
          : 'bg-white dark:bg-zinc-900'
      }`}
    >
      {isTopStory && (
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-teal-500 to-emerald-400" />
      )}

      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank indicator */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isTopStory
                ? 'bg-gradient-to-br from-teal-500 to-emerald-400 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
            }`}
          >
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group/link"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-snug group-hover/link:text-teal-600 dark:group-hover/link:text-teal-400 transition-colors">
                {article.title}
                <ArrowUpRight className="inline-block ml-1 w-4 h-4 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover/link:opacity-100 transition-all" />
              </h2>
            </a>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              {article.score !== undefined && (
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-teal-500" />
                  <span className="font-medium">{formatNumber(article.score)}</span>
                </div>
              )}

              {article.commentsCount !== undefined && (
                <a
                  href={article.commentsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{formatNumber(article.commentsCount)}</span>
                </a>
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

            {/* Source badge */}
            <div className="mt-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
                {article.source === 'hackernews' && (
                  <>
                    <span className="w-4 h-4 rounded bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold">
                      Y
                    </span>
                    Hacker News
                  </>
                )}
                {article.source === 'rss' && (
                  <>
                    <Newspaper className="w-4 h-4 text-teal-500" />
                    RSS
                  </>
                )}
                {article.source === 'github' && (
                  <>
                    <Github className="w-4 h-4" />
                    GitHub
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
