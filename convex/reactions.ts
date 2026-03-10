import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listBySeed = query({
  args: { seedId: v.id("seeds") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reactions")
      .withIndex("by_seed", (q) => q.eq("seedId", args.seedId))
      .collect();
  },
});

export const getUserReaction = query({
  args: { seedId: v.id("seeds") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("reactions")
      .withIndex("by_user_seed", (q) => q.eq("userId", userId).eq("seedId", args.seedId))
      .first();
  },
});

export const react = mutation({
  args: {
    seedId: v.id("seeds"),
    emotion: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if user already reacted
    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_seed", (q) => q.eq("userId", userId).eq("seedId", args.seedId))
      .first();

    if (existing) {
      // Update existing reaction
      await ctx.db.patch(existing._id, { emotion: args.emotion });
      return existing._id;
    }

    // Create new reaction
    const reactionId = await ctx.db.insert("reactions", {
      seedId: args.seedId,
      userId,
      emotion: args.emotion,
      createdAt: Date.now(),
    });

    // Update seed emotional score
    const seed = await ctx.db.get(args.seedId);
    if (seed) {
      await ctx.db.patch(args.seedId, {
        emotionalScore: seed.emotionalScore + 1,
      });
    }

    return reactionId;
  },
});

export const removeReaction = mutation({
  args: { seedId: v.id("seeds") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_seed", (q) => q.eq("userId", userId).eq("seedId", args.seedId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});
