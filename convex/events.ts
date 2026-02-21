import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("events").withIndex("by_start").order("asc").collect();
  },
});

export const listUpcoming = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const daysMs = (args.days ?? 7) * 24 * 60 * 60 * 1000;
    const endTime = now + daysMs;
    
    const events = await ctx.db
      .query("events")
      .withIndex("by_start")
      .order("asc")
      .collect();
    
    return events.filter(e => e.startTime >= now && e.startTime <= endTime);
  },
});

export const listByType = query({
  args: { type: v.union(v.literal("task"), v.literal("cron"), v.literal("meeting")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("task"), v.literal("cron"), v.literal("meeting")),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    recurring: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("events", {
      ...args,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

export const complete = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { completed: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    recurring: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
