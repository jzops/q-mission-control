import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("cronJobs")
      .order("desc")
      .collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("cronJobs")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    schedule: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cronJobs", {
      ...args,
      status: "active",
      runCount: 0,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("cronJobs"),
    name: v.optional(v.string()),
    schedule: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"), v.literal("failed"))),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    return await ctx.db.patch(id, filtered);
  },
});

export const recordRun = mutation({
  args: {
    id: v.id("cronJobs"),
    output: v.optional(v.string()),
    success: v.boolean(),
    nextRun: v.optional(v.number()),
  },
  handler: async (ctx, { id, output, success, nextRun }) => {
    const job = await ctx.db.get(id);
    if (!job) return;
    
    await ctx.db.patch(id, {
      lastRun: Date.now(),
      lastOutput: output,
      status: success ? "active" : "failed",
      runCount: (job.runCount || 0) + 1,
      nextRun,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("cronJobs") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
