'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Zap } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

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

      {/* Error content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
            Something went wrong
          </h2>

          <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-md">
            We encountered an error while loading the news feed. This might be a
            temporary issue with our data sources.
          </p>

          <div className="flex gap-4">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
            >
              Go home
            </Button>
          </div>

          {error.digest && (
            <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
