import { NextResponse } from 'next/server';
import { getNews, clearCache } from '@/lib/services/news';

export const revalidate = 300; // ISR: 5 minutes

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';

    if (forceRefresh) {
      clearCache();
    }

    const news = await getNews(forceRefresh);

    return NextResponse.json(news, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      {
        articles: [],
        lastUpdated: new Date(),
        sources: [{ name: 'HackerNews', status: 'error', count: 0 }],
        error: 'Failed to fetch news',
      },
      { status: 500 }
    );
  }
}
