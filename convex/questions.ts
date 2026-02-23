import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List questions
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("answered"), v.literal("dismissed"))),
    priority: v.optional(v.union(v.literal("urgent"), v.literal("normal"), v.literal("low"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, priority, limit = 50 }) => {
    let query = ctx.db.query("questions");
    
    if (status) {
      query = query.withIndex("by_status", (q) => q.eq("status", status));
    } else {
      query = query.withIndex("by_timestamp");
    }
    
    let results = await query.order("desc").take(limit);
    
    if (priority) {
      results = results.filter(q => q.priority === priority);
    }
    
    // Sort by priority (urgent first)
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };
    return results.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  },
});

// Get pending count
export const getPendingCount = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("questions")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return {
      total: pending.length,
      urgent: pending.filter(q => q.priority === "urgent").length,
      normal: pending.filter(q => q.priority === "normal").length,
      low: pending.filter(q => q.priority === "low").length,
    };
  },
});

// Ask a question
export const ask = mutation({
  args: {
    question: v.string(),
    context: v.optional(v.string()),
    category: v.union(
      v.literal("clarification"),
      v.literal("permission"),
      v.literal("preference"),
      v.literal("decision"),
      v.literal("feedback"),
      v.literal("other")
    ),
    priority: v.union(v.literal("urgent"), v.literal("normal"), v.literal("low")),
    relatedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("questions", {
      ...args,
      status: "pending",
      timestamp: Date.now(),
    });
  },
});

// Answer a question
export const answer = mutation({
  args: {
    id: v.id("questions"),
    answer: v.string(),
  },
  handler: async (ctx, { id, answer }) => {
    await ctx.db.patch(id, {
      answer,
      status: "answered",
      answeredAt: Date.now(),
    });
    
    // Log as a lesson if it's a preference question
    const question = await ctx.db.get(id);
    if (question && question.category === "preference") {
      await ctx.db.insert("lessons", {
        title: `Preference: ${question.question.substring(0, 50)}...`,
        description: question.question,
        lesson: answer,
        category: "style",
        source: "explicit",
        applied: false,
        timestamp: Date.now(),
      });
    }
  },
});

// Dismiss a question
export const dismiss = mutation({
  args: {
    id: v.id("questions"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, { id, reason }) => {
    await ctx.db.patch(id, {
      status: "dismissed",
      answer: reason || "Dismissed without answer",
      answeredAt: Date.now(),
    });
  },
});

// Batch answer/dismiss
export const batchUpdate = mutation({
  args: {
    ids: v.array(v.id("questions")),
    action: v.union(v.literal("dismiss"), v.literal("answer")),
    response: v.optional(v.string()),
  },
  handler: async (ctx, { ids, action, response }) => {
    for (const id of ids) {
      await ctx.db.patch(id, {
        status: action === "dismiss" ? "dismissed" : "answered",
        answer: response || (action === "dismiss" ? "Dismissed" : "Acknowledged"),
        answeredAt: Date.now(),
      });
    }
  },
});
