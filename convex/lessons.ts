import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List lessons
export const list = query({
  args: {
    category: v.optional(v.string()),
    applied: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { category, applied, limit = 50 }) => {
    let query = ctx.db.query("lessons");
    
    if (applied !== undefined) {
      query = query.withIndex("by_applied", (q) => q.eq("applied", applied));
    } else {
      query = query.withIndex("by_timestamp");
    }
    
    let results = await query.order("desc").take(limit);
    
    if (category) {
      results = results.filter(l => l.category === category);
    }
    
    return results;
  },
});

// Get unapplied lessons count
export const getUnappliedCount = query({
  args: {},
  handler: async (ctx) => {
    const unapplied = await ctx.db
      .query("lessons")
      .withIndex("by_applied", (q) => q.eq("applied", false))
      .collect();
    return unapplied.length;
  },
});

// Add a lesson
export const add = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    lesson: v.string(),
    category: v.union(
      v.literal("communication"),
      v.literal("technical"),
      v.literal("prioritization"),
      v.literal("style"),
      v.literal("process"),
      v.literal("other")
    ),
    source: v.union(
      v.literal("feedback"),
      v.literal("correction"),
      v.literal("observation"),
      v.literal("explicit")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("lessons", {
      ...args,
      applied: false,
      timestamp: Date.now(),
    });
  },
});

// Mark as applied
export const markApplied = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { applied: true });
  },
});

// Update lesson
export const update = mutation({
  args: {
    id: v.id("lessons"),
    lesson: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

// Delete lesson
export const remove = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Category type for lessons
const lessonCategory = v.union(
  v.literal("communication"),
  v.literal("technical"),
  v.literal("prioritization"),
  v.literal("style"),
  v.literal("process"),
  v.literal("other")
);

// Get lessons by category for AI to reference
export const getByCategory = query({
  args: { category: lessonCategory },
  handler: async (ctx, { category }) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_category", (q) => q.eq("category", category))
      .collect();
  },
});

// Get stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("lessons").collect();
    const applied = all.filter(l => l.applied).length;
    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    
    for (const lesson of all) {
      byCategory[lesson.category] = (byCategory[lesson.category] || 0) + 1;
      bySource[lesson.source] = (bySource[lesson.source] || 0) + 1;
    }
    
    return {
      total: all.length,
      applied,
      pending: all.length - applied,
      byCategory,
      bySource,
    };
  },
});
