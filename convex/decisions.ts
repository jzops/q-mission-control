import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List decisions
export const list = query({
  args: {
    reviewed: v.optional(v.boolean()),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { reviewed, category, limit = 50 }) => {
    let decisions;

    if (reviewed !== undefined) {
      decisions = await ctx.db.query("decisions")
        .withIndex("by_reviewed", (q) => q.eq("reviewed", reviewed))
        .order("desc")
        .take(limit);
    } else {
      decisions = await ctx.db.query("decisions")
        .withIndex("by_timestamp")
        .order("desc")
        .take(limit);
    }

    if (category) {
      return decisions.filter(d => d.category === category);
    }
    return decisions;
  },
});

// Get unreviewed count
export const getUnreviewedCount = query({
  args: {},
  handler: async (ctx) => {
    const unreviewed = await ctx.db
      .query("decisions")
      .withIndex("by_reviewed", (q) => q.eq("reviewed", false))
      .collect();
    return unreviewed.length;
  },
});

// Log a decision
export const log = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    alternatives: v.optional(v.string()),
    reasoning: v.string(),
    category: v.union(
      v.literal("email"),
      v.literal("scheduling"),
      v.literal("prioritization"),
      v.literal("communication"),
      v.literal("technical"),
      v.literal("other")
    ),
    impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("decisions", {
      ...args,
      reviewed: false,
      timestamp: Date.now(),
    });
  },
});

// Provide feedback on a decision
export const provideFeedback = mutation({
  args: {
    id: v.id("decisions"),
    feedback: v.union(v.literal("good"), v.literal("bad"), v.literal("neutral")),
    note: v.optional(v.string()),
  },
  handler: async (ctx, { id, feedback, note }) => {
    await ctx.db.patch(id, {
      feedback,
      feedbackNote: note,
      reviewed: true,
    });
    
    // If bad feedback, create a lesson learned
    if (feedback === "bad") {
      const decision = await ctx.db.get(id);
      if (decision) {
        await ctx.db.insert("lessons", {
          title: `Decision feedback: ${decision.title}`,
          description: decision.description,
          lesson: note || "This decision was marked as incorrect - avoid similar choices.",
          category: decision.category === "email" ? "communication" : 
                   decision.category === "technical" ? "technical" : "other",
          source: "feedback",
          applied: false,
          timestamp: Date.now(),
        });
      }
    }
  },
});

// Mark as reviewed without feedback
export const markReviewed = mutation({
  args: { id: v.id("decisions") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { reviewed: true });
  },
});

// Get feedback stats
export const getFeedbackStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("decisions").collect();
    const reviewed = all.filter(d => d.reviewed);
    const good = reviewed.filter(d => d.feedback === "good").length;
    const bad = reviewed.filter(d => d.feedback === "bad").length;
    const neutral = reviewed.filter(d => d.feedback === "neutral").length;
    
    return {
      total: all.length,
      reviewed: reviewed.length,
      pending: all.length - reviewed.length,
      good,
      bad,
      neutral,
      successRate: reviewed.length > 0 ? Math.round((good / reviewed.length) * 100) : 0,
    };
  },
});
