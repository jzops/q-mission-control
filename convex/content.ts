import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const stages = ["idea", "script", "thumbnail", "filming", "editing", "published"] as const;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("content").order("desc").collect();
  },
});

export const listByStage = query({
  args: { 
    stage: v.union(
      v.literal("idea"),
      v.literal("script"),
      v.literal("thumbnail"),
      v.literal("filming"),
      v.literal("editing"),
      v.literal("published")
    )
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("content")
      .withIndex("by_stage", (q) => q.eq("stage", args.stage))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("content", {
      ...args,
      stage: "idea",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateStage = mutation({
  args: {
    id: v.id("content"),
    stage: v.union(
      v.literal("idea"),
      v.literal("script"),
      v.literal("thumbnail"),
      v.literal("filming"),
      v.literal("editing"),
      v.literal("published")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      stage: args.stage,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("content"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    script: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    publishedUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("content") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
