import { NewsList } from './components/NewsList';
import { getNews } from '@/lib/services/news';
import { Separator } from '@/components/ui/separator';
import { Zap, Sparkles } from 'lucide-react';

export const revalidate = 300; // ISR: 5 minutes

export default async function Home() {
  let initialData;

  try {
    initialData = await getNews();
  } catch (error) {
    console.error('Failed to fetch initial news:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero section */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Live from Hacker News
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Stay ahead of the AI curve
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            The latest AI news, research breakthroughs, and tech discussions curated from top sources.
          </p>
        </div>

        <Separator className="my-8" />

        {/* News list */}
        <NewsList initialData={initialData} />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
            Powered by Hacker News API. Content curated for AI-related topics.
          </p>
        </div>
      </footer>
    </div>
  );
}
