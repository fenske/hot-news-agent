'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface RefreshButtonProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated?: Date;
}

export function RefreshButton({ onRefresh, isRefreshing, lastUpdated }: RefreshButtonProps) {
  return (
    <div className="flex items-center gap-3">
      {lastUpdated && (
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Updated {formatRelativeTime(lastUpdated)}
        </span>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  );
}
