import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    const seeds = await ctx.db
      .query("seeds")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    // Get author profiles
    const seedsWithAuthors = await Promise.all(
      seeds.map(async (seed) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", seed.authorId))
          .first();

        const branches = await ctx.db
          .query("branches")
          .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
          .collect();

        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
          .collect();

        return {
          ...seed,
          authorName: seed.isDreamSeed ? "Anonymous Dreamer" : (profile?.displayName ?? "Unknown Gardener"),
          branchCount: branches.length,
          reactionCount: reactions.length,
        };
      })
    );

    return seedsWithAuthors;
  },
});

export const listByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const seeds = await ctx.db
      .query("seeds")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc")
      .take(20);

    const seedsWithAuthors = await Promise.all(
      seeds.map(async (seed) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", seed.authorId))
          .first();

        const branches = await ctx.db
          .query("branches")
          .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
          .collect();

        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
          .collect();

        return {
          ...seed,
          authorName: seed.isDreamSeed ? "Anonymous Dreamer" : (profile?.displayName ?? "Unknown Gardener"),
          branchCount: branches.length,
          reactionCount: reactions.length,
        };
      })
    );

    return seedsWithAuthors;
  },
});

export const listByUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const seeds = await ctx.db
      .query("seeds")
      .withIndex("by_author", (q) => q.eq("authorId", userId))
      .order("desc")
      .collect();

    const seedsWithStats = await Promise.all(
      seeds.map(async (seed) => {
        const branches = await ctx.db
          .query("branches")
          .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
          .collect();

        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
          .collect();

        return {
          ...seed,
          authorName: "You",
          branchCount: branches.length,
          reactionCount: reactions.length,
        };
      })
    );

    return seedsWithStats;
  },
});

export const get = query({
  args: { id: v.id("seeds") },
  handler: async (ctx, args) => {
    const seed = await ctx.db.get(args.id);
    if (!seed) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", seed.authorId))
      .first();

    const branches = await ctx.db
      .query("branches")
      .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
      .collect();

    const branchesWithAuthors = await Promise.all(
      branches.map(async (branch) => {
        const branchProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", branch.authorId))
          .first();
        return {
          ...branch,
          authorName: branchProfile?.displayName ?? "Unknown Gardener",
        };
      })
    );

    const reactions = await ctx.db
      .query("reactions")
      .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
      .collect();

    return {
      ...seed,
      authorName: seed.isDreamSeed ? "Anonymous Dreamer" : (profile?.displayName ?? "Unknown Gardener"),
      branches: branchesWithAuthors,
      reactions,
      branchCount: branches.length,
      reactionCount: reactions.length,
    };
  },
});

export const getTrending = query({
  args: {},
  handler: async (ctx) => {
    const seeds = await ctx.db
      .query("seeds")
      .withIndex("by_growth")
      .order("desc")
      .take(10);

    const seedsWithStats = await Promise.all(
      seeds.map(async (seed) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", seed.authorId))
          .first();

        const branches = await ctx.db
          .query("branches")
          .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
          .collect();

        const reactions = await ctx.db
          .query("reactions")
          .withIndex("by_seed", (q) => q.eq("seedId", seed._id))
          .collect();

        return {
          ...seed,
          authorName: seed.isDreamSeed ? "Anonymous Dreamer" : (profile?.displayName ?? "Unknown Gardener"),
          branchCount: branches.length,
          reactionCount: reactions.length,
        };
      })
    );

    return seedsWithStats;
  },
});

export const plant = mutation({
  args: {
    content: v.string(),
    category: v.string(),
    isDreamSeed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const seedId = await ctx.db.insert("seeds", {
      authorId: userId,
      content: args.content,
      category: args.category,
      isDreamSeed: args.isDreamSeed,
      growthLevel: 1,
      emotionalScore: 0,
      solutionScore: 0,
      creativeScore: 0,
      createdAt: Date.now(),
    });

    // Update user profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      const newCount = profile.seedsPlanted + 1;
      let newTitle = profile.title;
      const total = newCount + profile.branchesGrown;
      if (total >= 100) newTitle = "Dream Architect";
      else if (total >= 50) newTitle = "Forest Philosopher";
      else if (total >= 20) newTitle = "Idea Gardener";

      await ctx.db.patch(profile._id, {
        seedsPlanted: newCount,
        title: newTitle,
      });
    }

    return seedId;
  },
});

const determineTreeType = (emotional: number, solution: number, creative: number): string | undefined => {
  const max = Math.max(emotional, solution, creative);
  if (max < 3) return undefined;
  if (emotional === max) return "heart";
  if (solution === max) return "wisdom";
  return "dream";
};

export const updateScores = mutation({
  args: {
    seedId: v.id("seeds"),
    branchType: v.string(),
  },
  handler: async (ctx, args) => {
    const seed = await ctx.db.get(args.seedId);
    if (!seed) throw new Error("Seed not found");

    let emotionalScore = seed.emotionalScore;
    let solutionScore = seed.solutionScore;
    let creativeScore = seed.creativeScore;

    // Update scores based on branch type
    if (args.branchType === "experience" || args.branchType === "advice") {
      emotionalScore += 1;
    } else if (args.branchType === "solution") {
      solutionScore += 1;
    } else if (args.branchType === "artwork" || args.branchType === "alternate" || args.branchType === "continuation") {
      creativeScore += 1;
    }

    const totalBranches = emotionalScore + solutionScore + creativeScore;
    const growthLevel = Math.min(5, Math.floor(totalBranches / 2) + 1);
    const treeType = determineTreeType(emotionalScore, solutionScore, creativeScore);

    await ctx.db.patch(args.seedId, {
      emotionalScore,
      solutionScore,
      creativeScore,
      growthLevel,
      treeType,
    });
  },
});
