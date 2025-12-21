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

// Pre-compile regex patterns with word boundaries for accurate matching
const AI_PATTERNS = AI_KEYWORDS.map(
  (kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
);

export function filterAIContent(stories: HNStory[]): HNStory[] {
  return stories.filter((story) => {
    const text = `${story.title} ${story.text || ''}`;
    return AI_PATTERNS.some((pattern) => pattern.test(text));
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

// Helper to create word boundary regex
function createWordBoundaryPattern(keyword: string): RegExp {
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
}

function detectTags(title: string): string[] {
  const tags: string[] = [];

  const tagPatterns: Record<string, RegExp[]> = {
    LLM: ['llm', 'gpt', 'claude', 'gemini', 'mistral', 'llama', 'chatgpt'].map(createWordBoundaryPattern),
    'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural'].map(createWordBoundaryPattern),
    OpenAI: ['openai', 'gpt', 'chatgpt', 'sora'].map(createWordBoundaryPattern),
    Anthropic: ['anthropic', 'claude'].map(createWordBoundaryPattern),
    Google: ['google', 'gemini', 'deepmind'].map(createWordBoundaryPattern),
    'Computer Vision': ['computer vision', 'diffusion', 'stable diffusion', 'midjourney', 'image'].map(createWordBoundaryPattern),
    NLP: ['nlp', 'language model', 'transformer'].map(createWordBoundaryPattern),
    Research: ['paper', 'research', 'study'].map(createWordBoundaryPattern),
  };

  for (const [tag, patterns] of Object.entries(tagPatterns)) {
    if (patterns.some((pattern) => pattern.test(title))) {
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
