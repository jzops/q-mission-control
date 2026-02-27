import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List OKRs
export const list = query({
  args: {
    quarter: v.optional(v.string()),
    status: v.optional(v.string()),
    owner: v.optional(v.string()),
  },
  handler: async (ctx, { quarter, status, owner }) => {
    let results = await ctx.db.query("okrs").order("desc").collect();
    
    if (quarter) {
      results = results.filter(o => o.quarter === quarter);
    }
    if (status) {
      results = results.filter(o => o.status === status);
    }
    if (owner) {
      results = results.filter(o => o.owner === owner);
    }
    
    return results;
  },
});

// Get current quarter OKRs
export const getCurrentQuarter = query({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const quarter = `Q${Math.ceil((now.getMonth() + 1) / 3)} ${now.getFullYear()}`;
    return await ctx.db
      .query("okrs")
      .withIndex("by_quarter", (q) => q.eq("quarter", quarter))
      .collect();
  },
});

// Create OKR
export const create = mutation({
  args: {
    objective: v.string(),
    keyResults: v.array(v.object({
      description: v.string(),
      target: v.number(),
      current: v.number(),
      unit: v.string(),
    })),
    quarter: v.string(),
    owner: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate status based on progress (guard against division by zero)
    const totalProgress = args.keyResults.length > 0
      ? args.keyResults.reduce((sum, kr) => {
          return sum + (kr.target > 0 ? (kr.current / kr.target) * 100 : 0);
        }, 0) / args.keyResults.length
      : 0;
    
    let status: "on_track" | "at_risk" | "behind" | "achieved" = "on_track";
    if (totalProgress >= 100) status = "achieved";
    else if (totalProgress < 50) status = "behind";
    else if (totalProgress < 70) status = "at_risk";
    
    return await ctx.db.insert("okrs", {
      ...args,
      status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update key result progress
export const updateProgress = mutation({
  args: {
    id: v.id("okrs"),
    keyResultIndex: v.number(),
    current: v.number(),
  },
  handler: async (ctx, { id, keyResultIndex, current }) => {
    const okr = await ctx.db.get(id);
    if (!okr) throw new Error("OKR not found");
    
    const keyResults = [...okr.keyResults];
    keyResults[keyResultIndex] = { ...keyResults[keyResultIndex], current };
    
    // Recalculate status (guard against division by zero)
    const totalProgress = keyResults.length > 0
      ? keyResults.reduce((sum, kr) => {
          return sum + (kr.target > 0 ? (kr.current / kr.target) * 100 : 0);
        }, 0) / keyResults.length
      : 0;
    
    let status: "on_track" | "at_risk" | "behind" | "achieved" = "on_track";
    if (totalProgress >= 100) status = "achieved";
    else if (totalProgress < 50) status = "behind";
    else if (totalProgress < 70) status = "at_risk";
    
    await ctx.db.patch(id, {
      keyResults,
      status,
      updatedAt: Date.now(),
    });
  },
});

// Update full OKR
export const update = mutation({
  args: {
    id: v.id("okrs"),
    objective: v.optional(v.string()),
    keyResults: v.optional(v.array(v.object({
      description: v.string(),
      target: v.number(),
      current: v.number(),
      unit: v.string(),
    }))),
    status: v.optional(v.union(
      v.literal("on_track"),
      v.literal("at_risk"),
      v.literal("behind"),
      v.literal("achieved")
    )),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

// Delete OKR
export const remove = mutation({
  args: { id: v.id("okrs") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Get summary stats
export const getSummary = query({
  args: { quarter: v.optional(v.string()) },
  handler: async (ctx, { quarter }) => {
    let okrs = await ctx.db.query("okrs").collect();
    
    if (quarter) {
      okrs = okrs.filter(o => o.quarter === quarter);
    }
    
    return {
      total: okrs.length,
      onTrack: okrs.filter(o => o.status === "on_track").length,
      atRisk: okrs.filter(o => o.status === "at_risk").length,
      behind: okrs.filter(o => o.status === "behind").length,
      achieved: okrs.filter(o => o.status === "achieved").length,
    };
  },
});
