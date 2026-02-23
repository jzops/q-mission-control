import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    const status = await ctx.db
      .query("systemStatus")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    return status?.value;
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const statuses = await ctx.db.query("systemStatus").collect();
    return Object.fromEntries(statuses.map(s => [s.key, { value: s.value, updatedAt: s.updatedAt }]));
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, { key, value }) => {
    const existing = await ctx.db
      .query("systemStatus")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { value, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("systemStatus", { key, value, updatedAt: Date.now() });
    }
  },
});

export const heartbeat = mutation({
  args: {
    status: v.optional(v.string()),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, { status = "online", currentTask }) => {
    // Update last heartbeat
    const heartbeatKey = "last_heartbeat";
    const existing = await ctx.db
      .query("systemStatus")
      .withIndex("by_key", (q) => q.eq("key", heartbeatKey))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, { value: Date.now().toString(), updatedAt: Date.now() });
    } else {
      await ctx.db.insert("systemStatus", { key: heartbeatKey, value: Date.now().toString(), updatedAt: Date.now() });
    }
    
    // Update Q status
    const statusKey = "q_status";
    const statusExisting = await ctx.db
      .query("systemStatus")
      .withIndex("by_key", (q) => q.eq("key", statusKey))
      .first();
    
    if (statusExisting) {
      await ctx.db.patch(statusExisting._id, { value: status, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("systemStatus", { key: statusKey, value: status, updatedAt: Date.now() });
    }
    
    // Update current task if provided
    if (currentTask !== undefined) {
      const taskKey = "current_task";
      const taskExisting = await ctx.db
        .query("systemStatus")
        .withIndex("by_key", (q) => q.eq("key", taskKey))
        .first();
      
      if (taskExisting) {
        await ctx.db.patch(taskExisting._id, { value: currentTask, updatedAt: Date.now() });
      } else {
        await ctx.db.insert("systemStatus", { key: taskKey, value: currentTask, updatedAt: Date.now() });
      }
    }
    
    // Log heartbeat activity
    await ctx.db.insert("activity", {
      agentName: "Q",
      type: "heartbeat",
      action: "Heartbeat",
      details: currentTask || "System check",
      timestamp: Date.now(),
    });
    
    return { status: "ok", timestamp: Date.now() };
  },
});
