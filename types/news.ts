export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: 'hackernews' | 'rss';
  sourceId: string;
  publishedAt: Date;
  author?: string;
  score?: number;
  commentsCount?: number;
  commentsUrl?: string;
  excerpt?: string;
  tags: string[];
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
