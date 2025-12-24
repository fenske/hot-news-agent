import { v } from "convex/values";
import { internalAction, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { TAG_PATTERNS, MAJOR_ENTITIES } from "../lib/constants";

// RSS feeds to collect from
const RSS_FEEDS = [
  // AI-specific sources (high importance)
  {
    name: "OpenAI Blog",
    url: "https://openai.com/blog/rss.xml",
    category: "ai_specific",
    baseScore: 9,
  },
  {
    name: "Anthropic News",
    url: "https://www.anthropic.com/rss.xml",
    category: "ai_specific",
    baseScore: 9,
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    category: "ai_specific",
    baseScore: 8,
  },
  {
    name: "Hugging Face Blog",
    url: "https://huggingface.co/blog/feed.xml",
    category: "ai_specific",
    baseScore: 7,
  },

  // Tech publications
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    category: "tech_publication",
    baseScore: 6,
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    category: "tech_publication",
    baseScore: 6,
  },
  {
    name: "MIT Tech Review",
    url: "https://www.technologyreview.com/feed/",
    category: "tech_publication",
    baseScore: 8,
  },
  {
    name: "Ars Technica",
    url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
    category: "tech_publication",
    baseScore: 6,
  },

  // Newsletters/Blogs
  {
    name: "The Batch",
    url: "https://www.deeplearning.ai/the-batch/feed/",
    category: "newsletter",
    baseScore: 7,
  },
  {
    name: "Simon Willison",
    url: "https://simonwillison.net/atom/everything/",
    category: "newsletter",
    baseScore: 7,
  },
];

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  content?: string;
  author?: string;
  pubDate?: string;
}

function detectTags(title: string): string[] {
  const tags: string[] = [];
  const titleLower = title.toLowerCase();

  for (const [tag, keywords] of Object.entries(TAG_PATTERNS)) {
    if (
      keywords.some((kw) => {
        const pattern = new RegExp(
          `\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`,
          "i"
        );
        return pattern.test(titleLower);
      })
    ) {
      tags.push(tag);
    }
  }

  return tags.length > 0 ? tags : ["AI"];
}

function extractEntities(title: string): string[] {
  const titleLower = title.toLowerCase();
  return MAJOR_ENTITIES.filter((entity) => titleLower.includes(entity));
}

function generateContentHash(title: string, url: string): string {
  const normalized = `${title.toLowerCase().replace(/[^a-z0-9]/g, "")}|${url.toLowerCase()}`;
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 33) ^ normalized.charCodeAt(i);
  }
  return Math.abs(hash).toString(16);
}

function generateExternalId(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function calculateRSSImportance(
  baseScore: number,
  publishedAt: number,
  entities: string[]
): number {
  let score = baseScore * 2; // 0-20 from source base

  // Recency bonus (0-15)
  const hoursOld = (Date.now() - publishedAt) / (1000 * 60 * 60);
  score += Math.max(0, 15 - hoursOld / 4);

  // Entity bonus (0-15)
  score += Math.min(15, entities.length * 5);

  return Math.min(100, Math.round(score));
}

async function fetchRSSFeed(url: string): Promise<RSSItem[]> {
  // Use rss2json.com API to parse RSS feeds
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`);
    }

    const data = await response.json();
    if (data.status !== "ok") {
      throw new Error(`RSS API error: ${data.message || "Unknown error"}`);
    }

    return data.items || [];
  } catch (error) {
    console.error(`Error fetching RSS from ${url}:`, error);
    return [];
  }
}

// Collect all RSS feeds
export const collectAll = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting RSS collection...");
    let totalCollected = 0;

    for (const feed of RSS_FEEDS) {
      try {
        const items = await fetchRSSFeed(feed.url);
        console.log(`${feed.name}: found ${items.length} items`);

        // Process up to 10 items per feed
        for (const item of items.slice(0, 10)) {
          if (!item.title || !item.link) continue;

          try {
            await ctx.runMutation(internal.collectors.rss.storeItem, {
              feedName: feed.name,
              feedUrl: feed.url,
              category: feed.category,
              baseScore: feed.baseScore,
              title: item.title,
              url: item.link,
              content: item.content || item.description,
              author: item.author,
              publishedAt: item.pubDate
                ? new Date(item.pubDate).getTime()
                : Date.now(),
            });
            totalCollected++;
          } catch (error) {
            console.error(`Failed to store item from ${feed.name}:`, error);
          }
        }

        // Small delay between feeds
        await new Promise((r) => setTimeout(r, 200));
      } catch (error) {
        console.error(`Error processing feed ${feed.name}:`, error);
      }
    }

    console.log(`RSS collection complete: ${totalCollected} items stored`);
    return { collected: totalCollected };
  },
});

// Store RSS item
export const storeItem = internalMutation({
  args: {
    feedName: v.string(),
    feedUrl: v.string(),
    category: v.string(),
    baseScore: v.number(),
    title: v.string(),
    url: v.string(),
    content: v.optional(v.string()),
    author: v.optional(v.string()),
    publishedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Get or create RSS source for this feed
    let source = await ctx.db
      .query("sources")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "rss"),
          q.eq(q.field("config.url"), args.feedUrl)
        )
      )
      .first();

    if (!source) {
      const sourceId = await ctx.db.insert("sources", {
        name: args.feedName,
        type: "rss",
        config: {
          url: args.feedUrl,
          category: args.category,
          pollIntervalMinutes: 30,
        },
        baseImportanceScore: args.baseScore,
        isActive: true,
      });
      source = await ctx.db.get(sourceId);
    }

    // Generate external ID from URL
    const externalId = generateExternalId(args.url);

    // Check if item already exists
    const existing = await ctx.db
      .query("items")
      .withIndex("by_external_id", (q) =>
        q.eq("sourceId", source!._id).eq("externalId", externalId)
      )
      .first();

    if (existing) {
      // Item already exists, skip
      return existing._id;
    }

    // Check for duplicates by content hash
    const contentHash = generateContentHash(args.title, args.url);
    const duplicate = await ctx.db
      .query("items")
      .withIndex("by_content_hash", (q) => q.eq("contentHash", contentHash))
      .first();

    // Calculate importance score
    const entities = extractEntities(args.title);
    const importanceScore = calculateRSSImportance(
      args.baseScore,
      args.publishedAt,
      entities
    );

    const now = Date.now();

    // Insert new item
    const itemId = await ctx.db.insert("items", {
      sourceId: source!._id,
      externalId,
      type: "article",
      title: args.title,
      url: args.url,
      author: args.author,
      publishedAt: args.publishedAt,
      collectedAt: now,
      // RSS items don't have engagement metrics
      score: undefined,
      commentsCount: undefined,
      commentsUrl: undefined,
      importanceScore,
      contentHash,
      canonicalItemId: duplicate?._id,
      tags: detectTags(args.title),
    });

    return itemId;
  },
});
