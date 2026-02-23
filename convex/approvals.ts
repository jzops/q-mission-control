import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List approvals
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"))),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { status, type, limit = 50 }) => {
    let query = ctx.db.query("approvals");
    
    if (status) {
      query = query.withIndex("by_status", (q) => q.eq("status", status));
    } else {
      query = query.withIndex("by_timestamp");
    }
    
    let results = await query.order("desc").take(limit);
    
    if (type) {
      results = results.filter(a => a.type === type);
    }
    
    // Sort pending by priority
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };
    return results.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },
});

// Get pending count
export const getPendingCount = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("approvals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return {
      total: pending.length,
      urgent: pending.filter(a => a.priority === "urgent").length,
      byType: {
        email: pending.filter(a => a.type === "email_send").length,
        social: pending.filter(a => a.type === "social_post").length,
        purchase: pending.filter(a => a.type === "purchase").length,
        other: pending.filter(a => !["email_send", "social_post", "purchase"].includes(a.type)).length,
      },
    };
  },
});

// Request approval
export const request = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("email_send"),
      v.literal("social_post"),
      v.literal("purchase"),
      v.literal("external_action"),
      v.literal("code_deploy"),
      v.literal("other")
    ),
    content: v.optional(v.string()),
    metadata: v.optional(v.string()),
    priority: v.union(v.literal("urgent"), v.literal("normal"), v.literal("low")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("approvals", {
      ...args,
      status: "pending",
      timestamp: Date.now(),
    });
  },
});

// Approve
export const approve = mutation({
  args: {
    id: v.id("approvals"),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, { id, feedback }) => {
    await ctx.db.patch(id, {
      status: "approved",
      feedback,
      decidedAt: Date.now(),
    });
  },
});

// Reject
export const reject = mutation({
  args: {
    id: v.id("approvals"),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, { id, feedback }) => {
    await ctx.db.patch(id, {
      status: "rejected",
      feedback,
      decidedAt: Date.now(),
    });
    
    // Log rejection as potential lesson
    const approval = await ctx.db.get(id);
    if (approval && feedback) {
      await ctx.db.insert("lessons", {
        title: `Rejected: ${approval.title}`,
        description: approval.description,
        lesson: feedback,
        category: approval.type === "email_send" ? "communication" : "process",
        source: "correction",
        applied: false,
        timestamp: Date.now(),
      });
    }
  },
});

// Batch approve/reject
export const batchDecide = mutation({
  args: {
    ids: v.array(v.id("approvals")),
    decision: v.union(v.literal("approve"), v.literal("reject")),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx, { ids, decision, feedback }) => {
    for (const id of ids) {
      await ctx.db.patch(id, {
        status: decision === "approve" ? "approved" : "rejected",
        feedback,
        decidedAt: Date.now(),
      });
    }
  },
});

// Check if approval exists for content (avoid duplicates)
export const checkExists = query({
  args: { 
    type: v.string(),
    title: v.string(),
  },
  handler: async (ctx, { type, title }) => {
    const existing = await ctx.db
      .query("approvals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.eq(q.field("title"), title))
      .first();
    return !!existing;
  },
});
