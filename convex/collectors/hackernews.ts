import { v } from "convex/values";
import { internalAction, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { AI_KEYWORDS, MAJOR_ENTITIES, TAG_PATTERNS } from "../lib/constants";

const HN_API_BASE = "https://hacker-news.firebaseio.com/v0";

interface HNStory {
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

// Pre-compile regex patterns for AI keyword matching
const AI_PATTERNS = AI_KEYWORDS.map(
  (kw) => new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
);

function isAIRelated(title: string, text?: string): boolean {
  const content = `${title} ${text || ""}`;
  return AI_PATTERNS.some((pattern) => pattern.test(content));
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
  // Normalize the content for hashing
  const normalized = `${title.toLowerCase().replace(/[^a-z0-9]/g, "")}|${normalizeUrl(url)}`;
  // Simple djb2 hash (crypto not available in Convex)
  let hash = 5381;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 33) ^ normalized.charCodeAt(i);
  }
  return Math.abs(hash).toString(16);
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove tracking parameters
    const trackingParams = [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "ref",
      "source",
    ];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    return parsed.toString().toLowerCase().replace(/\/$/, "");
  } catch {
    return url.toLowerCase();
  }
}

function calculateImportanceScore(
  baseScore: number,
  engagement: { points?: number; comments?: number },
  publishedAt: number,
  entities: string[]
): number {
  let score = baseScore * 2; // 0-20 from source base

  // Engagement bonus (0-25)
  const engagementValue =
    (engagement.points || 0) / 100 + (engagement.comments || 0) / 50;
  score += Math.min(25, engagementValue * 5);

  // Recency bonus (0-15)
  const hoursOld = (Date.now() - publishedAt) / (1000 * 60 * 60);
  score += Math.max(0, 15 - hoursOld / 4);

  // Entity bonus (0-15)
  score += Math.min(15, entities.length * 5);

  return Math.min(100, Math.round(score));
}

// Collect action - fetches from HN API and stores items
export const collect = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting Hacker News collection...");

    // Fetch top stories
    const topStoriesRes = await fetch(`${HN_API_BASE}/topstories.json`);
    const topStoryIds: number[] = await topStoriesRes.json();

    // Also fetch new stories for fresh content
    const newStoriesRes = await fetch(`${HN_API_BASE}/newstories.json`);
    const newStoryIds: number[] = await newStoriesRes.json();

    // Combine and dedupe, prioritize top stories
    const storyIds = [
      ...new Set([...topStoryIds.slice(0, 100), ...newStoryIds.slice(0, 50)]),
    ];

    // Fetch story details in batches
    const stories: HNStory[] = [];
    const batchSize = 20;

    for (let i = 0; i < Math.min(storyIds.length, 150); i += batchSize) {
      const batch = storyIds.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(async (id) => {
          try {
            const res = await fetch(`${HN_API_BASE}/item/${id}.json`);
            return res.json();
          } catch {
            return null;
          }
        })
      );
      stories.push(...batchResults.filter(Boolean));

      // Small delay between batches to avoid overwhelming the API
      if (i + batchSize < storyIds.length) {
        await new Promise((r) => setTimeout(r, 100));
      }
    }

    // Filter for AI-related stories
    const aiStories = stories.filter(
      (story) =>
        story.type === "story" &&
        story.title &&
        isAIRelated(story.title, story.text)
    );

    console.log(
      `Found ${aiStories.length} AI-related stories out of ${stories.length} total`
    );

    // Store items via mutation
    let storedCount = 0;
    for (const story of aiStories) {
      try {
        await ctx.runMutation(internal.collectors.hackernews.storeItem, {
          externalId: String(story.id),
          title: story.title,
          url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
          author: story.by,
          publishedAt: story.time * 1000,
          score: story.score,
          commentsCount: story.descendants || 0,
        });
        storedCount++;
      } catch (error) {
        console.error(`Failed to store story ${story.id}:`, error);
      }
    }

    return { collected: storedCount, total: aiStories.length };
  },
});

// Store item mutation - handles upsert and deduplication
export const storeItem = internalMutation({
  args: {
    externalId: v.string(),
    title: v.string(),
    url: v.string(),
    author: v.optional(v.string()),
    publishedAt: v.number(),
    score: v.optional(v.number()),
    commentsCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get or create HN source
    let source = await ctx.db
      .query("sources")
      .withIndex("by_type", (q) => q.eq("type", "hackernews"))
      .first();

    if (!source) {
      const sourceId = await ctx.db.insert("sources", {
        name: "Hacker News",
        type: "hackernews",
        config: { pollIntervalMinutes: 10 },
        baseImportanceScore: 7,
        isActive: true,
      });
      source = await ctx.db.get(sourceId);
    }

    // Check if item already exists
    const existing = await ctx.db
      .query("items")
      .withIndex("by_external_id", (q) =>
        q.eq("sourceId", source!._id).eq("externalId", args.externalId)
      )
      .first();

    const contentHash = generateContentHash(args.title, args.url);
    const now = Date.now();

    if (existing) {
      // Update engagement data only
      await ctx.db.patch(existing._id, {
        score: args.score,
        commentsCount: args.commentsCount,
        // Recalculate importance with updated engagement
        importanceScore: calculateImportanceScore(
          source!.baseImportanceScore,
          { points: args.score, comments: args.commentsCount },
          existing.publishedAt,
          extractEntities(args.title)
        ),
      });
      return existing._id;
    }

    // Check for duplicates by content hash
    const duplicate = await ctx.db
      .query("items")
      .withIndex("by_content_hash", (q) => q.eq("contentHash", contentHash))
      .first();

    // Calculate importance score
    const entities = extractEntities(args.title);
    const importanceScore = calculateImportanceScore(
      source!.baseImportanceScore,
      { points: args.score, comments: args.commentsCount },
      args.publishedAt,
      entities
    );

    // Insert new item
    const itemId = await ctx.db.insert("items", {
      sourceId: source!._id,
      externalId: args.externalId,
      type: "discussion",
      title: args.title,
      url: args.url,
      author: args.author,
      publishedAt: args.publishedAt,
      collectedAt: now,
      score: args.score,
      commentsCount: args.commentsCount,
      commentsUrl: `https://news.ycombinator.com/item?id=${args.externalId}`,
      importanceScore,
      contentHash,
      canonicalItemId: duplicate?._id,
      tags: detectTags(args.title),
    });

    return itemId;
  },
});
