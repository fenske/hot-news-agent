import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function NewsCardSkeleton() {
  return (
    <Card className="border-0 bg-white dark:bg-zinc-900">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />

            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>

            <div className="flex gap-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NewsListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}
