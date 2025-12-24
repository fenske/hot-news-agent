import { v } from "convex/values";
import { query, internalMutation } from "../_generated/server";

// Main feed query - returns top items sorted by importance
export const getFeed = query({
  args: {
    limit: v.optional(v.number()),
    minScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 30;
    const minScore = args.minScore || 0;

    // Get all items sorted by importance, excluding duplicates
    const items = await ctx.db
      .query("items")
      .withIndex("by_importance")
      .order("desc")
      .filter((q) =>
        q.and(
          q.gte(q.field("importanceScore"), minScore),
          q.eq(q.field("canonicalItemId"), undefined)
        )
      )
      .take(limit + 1);

    // Check if there are more items
    const hasMore = items.length > limit;
    const resultItems = hasMore ? items.slice(0, limit) : items;

    // Fetch source info for each item
    const itemsWithSource = await Promise.all(
      resultItems.map(async (item) => {
        const source = await ctx.db.get(item.sourceId);
        return {
          ...item,
          source: source ? { name: source.name, type: source.type } : null,
        };
      })
    );

    return {
      items: itemsWithSource,
      hasMore,
    };
  },
});

// Get recent items (chronological)
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
    hoursAgo: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const hoursAgo = args.hoursAgo || 24;
    const cutoff = Date.now() - hoursAgo * 60 * 60 * 1000;

    const items = await ctx.db
      .query("items")
      .withIndex("by_published")
      .order("desc")
      .filter((q) =>
        q.and(
          q.gte(q.field("publishedAt"), cutoff),
          q.eq(q.field("canonicalItemId"), undefined)
        )
      )
      .take(limit);

    const itemsWithSource = await Promise.all(
      items.map(async (item) => {
        const source = await ctx.db.get(item.sourceId);
        return {
          ...item,
          source: source ? { name: source.name, type: source.type } : null,
        };
      })
    );

    return itemsWithSource;
  },
});

// Get trending items (highest engagement velocity)
export const getTrending = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;

    // Get recent items with engagement
    const items = await ctx.db
      .query("items")
      .withIndex("by_collected")
      .order("desc")
      .filter((q) =>
        q.and(
          q.gte(q.field("collectedAt"), sixHoursAgo),
          q.eq(q.field("canonicalItemId"), undefined)
        )
      )
      .take(100);

    // Calculate velocity (engagement per hour)
    const itemsWithVelocity = items
      .filter((item) => (item.score || 0) > 0)
      .map((item) => {
        const hoursOld = Math.max(
          1,
          (Date.now() - item.collectedAt) / (1000 * 60 * 60)
        );
        const engagement = (item.score || 0) + (item.commentsCount || 0) * 2;
        const velocity = engagement / hoursOld;
        return { ...item, velocity };
      });

    // Sort by velocity and take top N
    itemsWithVelocity.sort((a, b) => b.velocity - a.velocity);
    const trending = itemsWithVelocity.slice(0, limit);

    const itemsWithSource = await Promise.all(
      trending.map(async (item) => {
        const source = await ctx.db.get(item.sourceId);
        return {
          ...item,
          source: source ? { name: source.name, type: source.type } : null,
        };
      })
    );

    return itemsWithSource;
  },
});

// Get items by source type
export const getBySource = query({
  args: {
    sourceType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get sources of this type
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_type", (q) =>
        q.eq(
          "type",
          args.sourceType as "hackernews" | "rss" | "github"
        )
      )
      .collect();

    if (sources.length === 0) return [];

    const sourceIds = new Set(sources.map((s) => s._id));

    // Get items sorted by importance
    const items = await ctx.db
      .query("items")
      .withIndex("by_importance")
      .order("desc")
      .filter((q) => q.eq(q.field("canonicalItemId"), undefined))
      .take(200);

    // Filter by source and limit
    const filtered = items
      .filter((item) => sourceIds.has(item.sourceId))
      .slice(0, limit);

    const itemsWithSource = await Promise.all(
      filtered.map(async (item) => {
        const source = await ctx.db.get(item.sourceId);
        return {
          ...item,
          source: source ? { name: source.name, type: source.type } : null,
        };
      })
    );

    return itemsWithSource;
  },
});

// Get a single item by ID
export const getById = query({
  args: {
    id: v.id("items"),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) return null;

    const source = await ctx.db.get(item.sourceId);
    return {
      ...item,
      source: source ? { name: source.name, type: source.type } : null,
    };
  },
});

// Stats query
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const allItems = await ctx.db.query("items").collect();
    const recentItems = allItems.filter((i) => i.collectedAt > oneDayAgo);

    const sources = await ctx.db.query("sources").collect();
    const sourceStats = sources.map((s) => ({
      name: s.name,
      type: s.type,
      count: allItems.filter((i) => i.sourceId === s._id).length,
      recentCount: recentItems.filter((i) => i.sourceId === s._id).length,
    }));

    return {
      totalItems: allItems.length,
      itemsLast24h: recentItems.length,
      sources: sourceStats,
    };
  },
});

// Cleanup old items (called by cron)
export const cleanupOldItems = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const oldItems = await ctx.db
      .query("items")
      .withIndex("by_published")
      .filter((q) => q.lt(q.field("publishedAt"), thirtyDaysAgo))
      .take(500); // Batch delete

    for (const item of oldItems) {
      await ctx.db.delete(item._id);
    }

    return { deleted: oldItems.length };
  },
});
