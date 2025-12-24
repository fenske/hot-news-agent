import { v } from "convex/values";
import { internalAction, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

const GITHUB_API = "https://api.github.com";

// Key AI repos to watch for releases
const TRACKED_REPOS = [
  "openai/openai-python",
  "anthropics/anthropic-sdk-python",
  "huggingface/transformers",
  "langchain-ai/langchain",
  "run-llama/llama_index",
  "vllm-project/vllm",
  "ollama/ollama",
  "ggerganov/llama.cpp",
  "microsoft/autogen",
  "crewAIInc/crewAI",
  "lm-sys/FastChat",
  "guidance-ai/guidance",
];

// Topics to search for trending repos
const AI_TOPICS = ["llm", "machine-learning", "langchain", "transformers"];

interface GitHubRelease {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
}

interface GitHubRepo {
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  created_at: string;
}

function generateContentHash(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash).toString(16);
}

async function fetchLatestRelease(
  repo: string
): Promise<GitHubRelease | null> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "hot-news-agent",
    };

    // Use token if available
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const response = await fetch(`${GITHUB_API}/repos/${repo}/releases/latest`, {
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) return null; // No releases
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching release for ${repo}:`, error);
    return null;
  }
}

async function searchTrendingRepos(topic: string): Promise<GitHubRepo[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "hot-news-agent",
    };

    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    // Search for repos created in the last 7 days with good stars
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const query = `topic:${topic} created:>${weekAgo} stars:>50`;

    const response = await fetch(
      `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=5`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`GitHub search error: ${response.status}`);
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error searching topic ${topic}:`, error);
    return [];
  }
}

// Main collect action
export const collect = internalAction({
  args: {},
  handler: async (ctx) => {
    console.log("Starting GitHub collection...");
    let totalCollected = 0;

    // 1. Check tracked repos for new releases
    console.log("Checking tracked repos for releases...");
    for (const repo of TRACKED_REPOS) {
      try {
        const release = await fetchLatestRelease(repo);
        if (release) {
          await ctx.runMutation(internal.collectors.github.storeRelease, {
            repo,
            tagName: release.tag_name,
            name: release.name || release.tag_name,
            body: release.body,
            publishedAt: new Date(release.published_at).getTime(),
            htmlUrl: release.html_url,
          });
          totalCollected++;
        }

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 100));
      } catch (error) {
        console.error(`Error processing release for ${repo}:`, error);
      }
    }

    // 2. Search for trending AI repos (limit to 2 topics to avoid rate limits)
    console.log("Searching for trending repos...");
    for (const topic of AI_TOPICS.slice(0, 2)) {
      try {
        const repos = await searchTrendingRepos(topic);
        for (const repo of repos.slice(0, 3)) {
          await ctx.runMutation(internal.collectors.github.storeTrendingRepo, {
            fullName: repo.full_name,
            description: repo.description || "New trending repository",
            htmlUrl: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            topics: repo.topics || [],
            createdAt: new Date(repo.created_at).getTime(),
          });
          totalCollected++;
        }

        await new Promise((r) => setTimeout(r, 500));
      } catch (error) {
        console.error(`Error searching topic ${topic}:`, error);
      }
    }

    console.log(`GitHub collection complete: ${totalCollected} items processed`);
    return { collected: totalCollected };
  },
});

// Store release
export const storeRelease = internalMutation({
  args: {
    repo: v.string(),
    tagName: v.string(),
    name: v.string(),
    body: v.optional(v.string()),
    publishedAt: v.number(),
    htmlUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Get or create GitHub source
    let source = await ctx.db
      .query("sources")
      .withIndex("by_type", (q) => q.eq("type", "github"))
      .first();

    if (!source) {
      const sourceId = await ctx.db.insert("sources", {
        name: "GitHub",
        type: "github",
        config: { pollIntervalMinutes: 60 },
        baseImportanceScore: 8,
        isActive: true,
      });
      source = await ctx.db.get(sourceId);
    }

    const externalId = `release:${args.repo}:${args.tagName}`;

    // Check if exists
    const existing = await ctx.db
      .query("items")
      .withIndex("by_external_id", (q) =>
        q.eq("sourceId", source!._id).eq("externalId", externalId)
      )
      .first();

    if (existing) {
      // Already have this release
      return existing._id;
    }

    const contentHash = generateContentHash(`${args.repo}:${args.tagName}`);
    const now = Date.now();

    // Releases from tracked repos are important
    const importanceScore = 70;

    const itemId = await ctx.db.insert("items", {
      sourceId: source!._id,
      externalId,
      type: "repo",
      title: `${args.repo} ${args.name}`,
      url: args.htmlUrl,
      author: args.repo.split("/")[0],
      publishedAt: args.publishedAt,
      collectedAt: now,
      score: undefined,
      commentsCount: undefined,
      commentsUrl: undefined,
      importanceScore,
      contentHash,
      canonicalItemId: undefined,
      tags: ["Release", args.repo.split("/")[0]],
    });

    return itemId;
  },
});

// Store trending repo
export const storeTrendingRepo = internalMutation({
  args: {
    fullName: v.string(),
    description: v.string(),
    htmlUrl: v.string(),
    stars: v.number(),
    forks: v.number(),
    language: v.optional(v.string()),
    topics: v.array(v.string()),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Get or create GitHub source
    let source = await ctx.db
      .query("sources")
      .withIndex("by_type", (q) => q.eq("type", "github"))
      .first();

    if (!source) {
      const sourceId = await ctx.db.insert("sources", {
        name: "GitHub",
        type: "github",
        config: { pollIntervalMinutes: 60 },
        baseImportanceScore: 6,
        isActive: true,
      });
      source = await ctx.db.get(sourceId);
    }

    const externalId = `trending:${args.fullName}`;

    // Check if exists
    const existing = await ctx.db
      .query("items")
      .withIndex("by_external_id", (q) =>
        q.eq("sourceId", source!._id).eq("externalId", externalId)
      )
      .first();

    if (existing) {
      // Update star count if it changed significantly
      if (Math.abs((existing.score || 0) - args.stars) > 10) {
        await ctx.db.patch(existing._id, {
          score: args.stars,
          importanceScore: Math.min(100, 30 + args.stars / 10),
        });
      }
      return existing._id;
    }

    const contentHash = generateContentHash(args.fullName);
    const now = Date.now();

    // Calculate importance based on stars
    const importanceScore = Math.min(100, Math.round(30 + args.stars / 10));

    const itemId = await ctx.db.insert("items", {
      sourceId: source!._id,
      externalId,
      type: "repo",
      title: `${args.fullName}: ${args.description}`,
      url: args.htmlUrl,
      author: args.fullName.split("/")[0],
      publishedAt: args.createdAt,
      collectedAt: now,
      score: args.stars,
      commentsCount: args.forks,
      commentsUrl: `${args.htmlUrl}/network/members`,
      importanceScore,
      contentHash,
      canonicalItemId: undefined,
      tags: args.topics.slice(0, 3).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
    });

    return itemId;
  },
});
