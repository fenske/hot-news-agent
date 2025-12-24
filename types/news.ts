export type SourceType = 'hackernews' | 'rss' | 'github';

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: SourceType;
  sourceId: string;
  publishedAt: Date;
  author?: string;
  score?: number;
  commentsCount?: number;
  commentsUrl?: string;
  excerpt?: string;
  tags: string[];
}

// Convex item with source info attached
export interface ConvexNewsItem {
  _id: string;
  _creationTime: number;
  sourceId: string;
  externalId: string;
  type: 'article' | 'discussion' | 'repo';
  title: string;
  url: string;
  author?: string;
  publishedAt: number;
  collectedAt: number;
  score?: number;
  commentsCount?: number;
  commentsUrl?: string;
  importanceScore: number;
  contentHash: string;
  canonicalItemId?: string;
  tags: string[];
  source: {
    name: string;
    type: SourceType;
  } | null;
  velocity?: number;
}

export interface NewsResponse {
  articles: NewsArticle[];
  lastUpdated: Date;
  sources: {
    name: string;
    status: 'success' | 'error' | 'partial';
    count: number;
  }[];
}

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  text?: string;
  by: string;
  time: number;
  score: number;
  descendants?: number;
  type: string;
}
