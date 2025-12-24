import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Hacker News - every 10 minutes
crons.interval(
  "collect:hackernews",
  { minutes: 10 },
  internal.collectors.hackernews.collect
);

// RSS feeds - every 30 minutes
crons.interval(
  "collect:rss",
  { minutes: 30 },
  internal.collectors.rss.collectAll
);

// GitHub trending/releases - every hour
crons.interval(
  "collect:github",
  { hours: 1 },
  internal.collectors.github.collect
);

// Cleanup old items (>30 days) - daily at 3am UTC
crons.daily(
  "cleanup:old-items",
  { hourUTC: 3, minuteUTC: 0 },
  internal.functions.items.cleanupOldItems
);

export default crons;
