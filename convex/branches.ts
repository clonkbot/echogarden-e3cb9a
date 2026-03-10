import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listBySeed = query({
  args: { seedId: v.id("seeds") },
  handler: async (ctx, args) => {
    const branches = await ctx.db
      .query("branches")
      .withIndex("by_seed", (q) => q.eq("seedId", args.seedId))
      .order("desc")
      .collect();

    const branchesWithAuthors = await Promise.all(
      branches.map(async (branch) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", branch.authorId))
          .first();
        return {
          ...branch,
          authorName: profile?.displayName ?? "Unknown Gardener",
        };
      })
    );

    return branchesWithAuthors;
  },
});

export const grow = mutation({
  args: {
    seedId: v.id("seeds"),
    content: v.string(),
    branchType: v.string(),
    parentBranchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const branchId = await ctx.db.insert("branches", {
      seedId: args.seedId,
      authorId: userId,
      content: args.content,
      branchType: args.branchType,
      parentBranchId: args.parentBranchId,
      createdAt: Date.now(),
    });

    // Update seed scores
    const seed = await ctx.db.get(args.seedId);
    if (seed) {
      let emotionalScore = seed.emotionalScore;
      let solutionScore = seed.solutionScore;
      let creativeScore = seed.creativeScore;

      if (args.branchType === "experience" || args.branchType === "advice") {
        emotionalScore += 1;
      } else if (args.branchType === "solution") {
        solutionScore += 1;
      } else if (args.branchType === "artwork" || args.branchType === "alternate" || args.branchType === "continuation") {
        creativeScore += 1;
      }

      const totalBranches = emotionalScore + solutionScore + creativeScore;
      const growthLevel = Math.min(5, Math.floor(totalBranches / 2) + 1);

      let treeType = seed.treeType;
      const max = Math.max(emotionalScore, solutionScore, creativeScore);
      if (max >= 3) {
        if (emotionalScore === max) treeType = "heart";
        else if (solutionScore === max) treeType = "wisdom";
        else treeType = "dream";
      }

      await ctx.db.patch(args.seedId, {
        emotionalScore,
        solutionScore,
        creativeScore,
        growthLevel,
        treeType,
      });
    }

    // Update user profile
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      const newCount = profile.branchesGrown + 1;
      let newTitle = profile.title;
      const total = profile.seedsPlanted + newCount;
      if (total >= 100) newTitle = "Dream Architect";
      else if (total >= 50) newTitle = "Forest Philosopher";
      else if (total >= 20) newTitle = "Idea Gardener";

      await ctx.db.patch(profile._id, {
        branchesGrown: newCount,
        title: newTitle,
      });
    }

    return branchId;
  },
});
