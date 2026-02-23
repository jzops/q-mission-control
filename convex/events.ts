import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const eventTypeValidator = v.union(
  v.literal("task"),
  v.literal("cron"),
  v.literal("meeting"),
  v.literal("birthday"),
  v.literal("deadline"),
  v.literal("reminder")
);

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
    
    return events.filter(e => e.startTime >= now && e.startTime <= endTime && !e.completed);
  },
});

export const listByType = query({
  args: { type: eventTypeValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("events")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

export const listForMonth = query({
  args: { year: v.number(), month: v.number() },
  handler: async (ctx, { year, month }) => {
    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 0, 23, 59, 59).getTime();
    
    const events = await ctx.db
      .query("events")
      .withIndex("by_start")
      .collect();
    
    return events.filter(e => e.startTime >= start && e.startTime <= end);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: eventTypeValidator,
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
    type: v.optional(eventTypeValidator),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    recurring: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
