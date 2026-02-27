import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Activity type union - matches schema exactly
const activityType = v.union(
  v.literal("task_started"),
  v.literal("task_completed"),
  v.literal("email_drafted"),
  v.literal("memory_added"),
  v.literal("cron_executed"),
  v.literal("heartbeat"),
  v.literal("session_started"),
  v.literal("decision_made"),
  v.literal("approval_requested"),
  v.literal("question_asked"),
  v.literal("error"),
  v.literal("info")
);

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    return await ctx.db
      .query("activity")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const listByType = query({
  args: {
    type: activityType,
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { type, limit = 20 }) => {
    return await ctx.db
      .query("activity")
      .withIndex("by_type", (q) => q.eq("type", type))
      .order("desc")
      .take(limit);
  },
});

export const log = mutation({
  args: {
    agentId: v.optional(v.id("agents")),
    agentName: v.optional(v.string()),
    type: activityType,
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getRecentCount = query({
  args: {
    hours: v.number(),
    type: v.optional(activityType),
  },
  handler: async (ctx, { hours, type }) => {
    const since = Date.now() - (hours * 60 * 60 * 1000);

    // Filter at database level for better performance
    const activities = await ctx.db
      .query("activity")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    // Only filter by type in memory if needed
    if (type) {
      return activities.filter(a => a.type === type).length;
    }
    return activities.length;
  },
});

export const getActivityByHour = query({
  args: { hours: v.number() },
  handler: async (ctx, { hours }) => {
    const since = Date.now() - (hours * 60 * 60 * 1000);

    // Filter at database level
    const activities = await ctx.db
      .query("activity")
      .withIndex("by_timestamp")
      .filter((q) => q.gte(q.field("timestamp"), since))
      .collect();

    const hourBuckets: Record<number, number> = {};

    for (let i = 0; i < hours; i++) {
      hourBuckets[i] = 0;
    }

    for (const activity of activities) {
      const hoursAgo = Math.floor((Date.now() - activity.timestamp) / (60 * 60 * 1000));
      if (hoursAgo < hours) {
        hourBuckets[hoursAgo] = (hourBuckets[hoursAgo] || 0) + 1;
      }
    }

    return Object.entries(hourBuckets)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .reverse();
  },
});

export const clear = mutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, { olderThanDays }) => {
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
    const old = await ctx.db
      .query("activity")
      .withIndex("by_timestamp")
      .filter((q) => q.lt(q.field("timestamp"), cutoff))
      .collect();

    for (const activity of old) {
      await ctx.db.delete(activity._id);
    }
    return old.length;
  },
});
