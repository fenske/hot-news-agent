import { HNStory, NewsArticle } from '@/types/news';

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';
const FETCH_TIMEOUT = 5000;

const AI_KEYWORDS = [
  'ai',
  'artificial intelligence',
  'machine learning',
  'ml',
  'llm',
  'gpt',
  'claude',
  'openai',
  'anthropic',
  'deepmind',
  'neural',
  'transformer',
  'chatgpt',
  'gemini',
  'mistral',
  'llama',
  'copilot',
  'deep learning',
  'nlp',
  'computer vision',
  'generative',
  'diffusion',
  'stable diffusion',
  'midjourney',
  'sora',
];

async function fetchWithTimeout(
  url: string,
  timeout: number = FETCH_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 300 },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchTopStories(limit = 50): Promise<HNStory[]> {
  const response = await fetchWithTimeout(`${HN_API_BASE}/topstories.json`);
  const ids: number[] = await response.json();
  const topIds = ids.slice(0, limit);

  const stories = await Promise.all(
    topIds.map(async (id) => {
      try {
        const res = await fetchWithTimeout(`${HN_API_BASE}/item/${id}.json`);
        return res.json();
      } catch {
        return null;
      }
    })
  );

  return stories.filter((story): story is HNStory => story !== null);
}

export function filterAIContent(stories: HNStory[]): HNStory[] {
  return stories.filter((story) => {
    const text = `${story.title} ${story.text || ''}`.toLowerCase();
    return AI_KEYWORDS.some((kw) => text.includes(kw));
  });
}

export function normalizeHNStory(story: HNStory): NewsArticle {
  return {
    id: `hackernews-${story.id}`,
    title: story.title,
    url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
    source: 'hackernews',
    sourceId: String(story.id),
    publishedAt: new Date(story.time * 1000),
    author: story.by,
    score: story.score,
    commentsCount: story.descendants || 0,
    commentsUrl: `https://news.ycombinator.com/item?id=${story.id}`,
    tags: detectTags(story.title),
  };
}

function detectTags(title: string): string[] {
  const tags: string[] = [];
  const lowerTitle = title.toLowerCase();

  const tagPatterns: Record<string, string[]> = {
    LLM: ['llm', 'gpt', 'claude', 'gemini', 'mistral', 'llama', 'chatgpt'],
    'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural'],
    OpenAI: ['openai', 'gpt', 'chatgpt', 'sora'],
    Anthropic: ['anthropic', 'claude'],
    Google: ['google', 'gemini', 'deepmind'],
    'Computer Vision': ['computer vision', 'diffusion', 'stable diffusion', 'midjourney', 'image'],
    NLP: ['nlp', 'language model', 'transformer'],
    Research: ['paper', 'research', 'study'],
  };

  for (const [tag, keywords] of Object.entries(tagPatterns)) {
    if (keywords.some((kw) => lowerTitle.includes(kw))) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ['AI'];
}

export async function fetchAINews(): Promise<NewsArticle[]> {
  const stories = await fetchTopStories(50);
  const aiStories = filterAIContent(stories);
  return aiStories.map(normalizeHNStory);
}
