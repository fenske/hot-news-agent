import { NewsListSkeleton } from './components/NewsCardSkeleton';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Coffee } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero section skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-48 rounded-full mb-4" />
          <Skeleton className="h-10 w-3/4 mb-3" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>

        <Separator className="my-8" />

        {/* News list skeleton */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-24" />
        </div>

        <NewsListSkeleton />
      </main>
    </div>
  );
}
