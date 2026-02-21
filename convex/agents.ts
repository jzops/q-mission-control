import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").collect();
  },
});

export const listByRole = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

export const listWorking = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "working"))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    responsibilities: v.array(v.string()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      ...args,
      status: "idle",
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("agents"),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("offline")),
    currentTask: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    
    // Log activity
    if (args.status === "working" && args.currentTask) {
      await ctx.db.insert("activity", {
        agentId: id,
        action: "started_task",
        details: args.currentTask,
        timestamp: Date.now(),
      });
    }
  },
});

export const update = mutation({
  args: {
    id: v.id("agents"),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    responsibilities: v.optional(v.array(v.string())),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("agents") },
  handler: async (ctx, args) => {
    // Remove associated activity
    const activities = await ctx.db
      .query("activity")
      .withIndex("by_agent", (q) => q.eq("agentId", args.id))
      .collect();
    for (const a of activities) {
      await ctx.db.delete(a._id);
    }
    await ctx.db.delete(args.id);
  },
});

export const getActivity = query({
  args: { agentId: v.optional(v.id("agents")), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    if (args.agentId) {
      return await ctx.db
        .query("activity")
        .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
        .order("desc")
        .take(limit);
    }
    return await ctx.db
      .query("activity")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const logActivity = mutation({
  args: {
    agentId: v.id("agents"),
    action: v.string(),
    details: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activity", {
      ...args,
      timestamp: Date.now(),
    });
  },
});
