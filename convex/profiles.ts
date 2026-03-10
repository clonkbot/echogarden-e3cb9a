import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    return profile;
  },
});

export const getByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const createOrUpdate = mutation({
  args: { displayName: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { displayName: args.displayName });
      return existing._id;
    }

    return await ctx.db.insert("profiles", {
      userId,
      displayName: args.displayName,
      title: "Seed Planter",
      seedsPlanted: 0,
      branchesGrown: 0,
      gardenDecorations: [],
      createdAt: Date.now(),
    });
  },
});

const getTitleForStats = (seedsPlanted: number, branchesGrown: number): string => {
  const total = seedsPlanted + branchesGrown;
  if (total >= 100) return "Dream Architect";
  if (total >= 50) return "Forest Philosopher";
  if (total >= 20) return "Idea Gardener";
  return "Seed Planter";
};

export const incrementSeeds = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      const newCount = profile.seedsPlanted + 1;
      const newTitle = getTitleForStats(newCount, profile.branchesGrown);
      await ctx.db.patch(profile._id, {
        seedsPlanted: newCount,
        title: newTitle,
      });
    }
  },
});

export const incrementBranches = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      const newCount = profile.branchesGrown + 1;
      const newTitle = getTitleForStats(profile.seedsPlanted, newCount);
      await ctx.db.patch(profile._id, {
        branchesGrown: newCount,
        title: newTitle,
      });
    }
  },
});
