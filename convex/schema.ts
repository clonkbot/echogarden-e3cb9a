import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profiles with garden stats
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    title: v.string(), // "Seed Planter", "Idea Gardener", etc.
    seedsPlanted: v.number(),
    branchesGrown: v.number(),
    gardenDecorations: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Seeds - the core content
  seeds: defineTable({
    authorId: v.id("users"),
    content: v.string(),
    category: v.string(), // "creativity", "life-advice", "dreams", "future-tech", "philosophy"
    treeType: v.optional(v.string()), // "heart", "wisdom", "dream" - evolves based on responses
    isDreamSeed: v.boolean(), // anonymous deep thoughts
    growthLevel: v.number(), // 1-5, increases with branches
    emotionalScore: v.number(),
    solutionScore: v.number(),
    creativeScore: v.number(),
    createdAt: v.number(),
  })
    .index("by_author", ["authorId"])
    .index("by_category", ["category"])
    .index("by_growth", ["growthLevel"])
    .index("by_created", ["createdAt"]),

  // Branches - responses that grow from seeds
  branches: defineTable({
    seedId: v.id("seeds"),
    authorId: v.id("users"),
    content: v.string(),
    branchType: v.string(), // "advice", "continuation", "experience", "artwork", "solution", "alternate"
    parentBranchId: v.optional(v.id("branches")), // for nested branches
    createdAt: v.number(),
  })
    .index("by_seed", ["seedId"])
    .index("by_author", ["authorId"]),

  // Emotional reactions (instead of likes)
  reactions: defineTable({
    seedId: v.id("seeds"),
    userId: v.id("users"),
    emotion: v.string(), // "love", "inspire", "comfort", "wonder", "hope"
    createdAt: v.number(),
  })
    .index("by_seed", ["seedId"])
    .index("by_user_seed", ["userId", "seedId"]),

  // Following gardeners
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"]),
});
