import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Data sources configuration
  sources: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("hackernews"),
      v.literal("rss"),
      v.literal("github")
    ),
    config: v.object({
      url: v.optional(v.string()),
      category: v.optional(v.string()),
      pollIntervalMinutes: v.number(),
    }),
    baseImportanceScore: v.number(), // 1-10
    isActive: v.boolean(),
    lastPolledAt: v.optional(v.number()), // Unix timestamp
  })
    .index("by_type", ["type"])
    .index("by_active", ["isActive"]),

  // Normalized news items
  items: defineTable({
    sourceId: v.id("sources"),
    externalId: v.string(), // Original ID from source
    type: v.union(
      v.literal("article"),
      v.literal("discussion"),
      v.literal("repo")
    ),

    // Core content - maps to existing NewsArticle interface
    title: v.string(),
    url: v.string(),
    author: v.optional(v.string()),
    publishedAt: v.number(), // Unix timestamp in ms
    collectedAt: v.number(), // Unix timestamp in ms

    // Engagement metrics
    score: v.optional(v.number()),
    commentsCount: v.optional(v.number()),
    commentsUrl: v.optional(v.string()),

    // Computed scores
    importanceScore: v.number(), // 0-100
    contentHash: v.string(), // For deduplication

    // Deduplication - points to primary if this is a duplicate
    canonicalItemId: v.optional(v.id("items")),

    // Categorization
    tags: v.array(v.string()),
  })
    .index("by_source", ["sourceId"])
    .index("by_external_id", ["sourceId", "externalId"])
    .index("by_content_hash", ["contentHash"])
    .index("by_importance", ["importanceScore"])
    .index("by_published", ["publishedAt"])
    .index("by_collected", ["collectedAt"]),
});
