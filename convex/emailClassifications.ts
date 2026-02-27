import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get classification by email ID
 */
export const getByEmailId = query({
  args: { emailId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailClassifications")
      .withIndex("by_email", (q) => q.eq("emailId", args.emailId))
      .first();
  },
});

/**
 * List classifications by category
 */
export const listByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("emailClassifications")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .order("desc");

    if (args.limit) {
      return await query.take(args.limit);
    }
    return await query.collect();
  },
});

/**
 * List recent classifications
 */
export const listRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const query = ctx.db
      .query("emailClassifications")
      .withIndex("by_processed")
      .order("desc");

    return await query.take(args.limit || 50);
  },
});

/**
 * Get classification statistics
 */
export const getStats = query({
  args: {
    since: v.optional(v.number()), // Timestamp to count from
  },
  handler: async (ctx, args) => {
    const since = args.since || Date.now() - 7 * 24 * 60 * 60 * 1000; // Default: last 7 days

    const classifications = await ctx.db
      .query("emailClassifications")
      .withIndex("by_processed")
      .filter((q) => q.gte(q.field("processedAt"), since))
      .collect();

    const stats: Record<string, number> = {};
    let autoReplyCount = 0;

    for (const c of classifications) {
      stats[c.category] = (stats[c.category] || 0) + 1;
      if (c.shouldAutoReply) autoReplyCount++;
    }

    return {
      total: classifications.length,
      byCategory: stats,
      autoReplyCount,
      period: "last_7_days",
    };
  },
});

/**
 * Create classification record
 */
export const create = mutation({
  args: {
    emailId: v.string(),
    threadId: v.string(),
    category: v.string(),
    confidence: v.number(),
    priority: v.number(),
    shouldAutoReply: v.boolean(),
    reasoning: v.string(),
    senderDomain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already classified
    const existing = await ctx.db
      .query("emailClassifications")
      .withIndex("by_email", (q) => q.eq("emailId", args.emailId))
      .first();

    if (existing) {
      // Update existing classification
      await ctx.db.patch(existing._id, {
        category: args.category,
        confidence: args.confidence,
        priority: args.priority,
        shouldAutoReply: args.shouldAutoReply,
        reasoning: args.reasoning,
        processedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("emailClassifications", {
      emailId: args.emailId,
      threadId: args.threadId,
      category: args.category,
      confidence: args.confidence,
      priority: args.priority,
      shouldAutoReply: args.shouldAutoReply,
      reasoning: args.reasoning,
      senderDomain: args.senderDomain,
      processedAt: Date.now(),
    });
  },
});

/**
 * Bulk create classifications
 */
export const createBatch = mutation({
  args: {
    classifications: v.array(
      v.object({
        emailId: v.string(),
        threadId: v.string(),
        category: v.string(),
        confidence: v.number(),
        priority: v.number(),
        shouldAutoReply: v.boolean(),
        reasoning: v.string(),
        senderDomain: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const c of args.classifications) {
      const id = await ctx.db.insert("emailClassifications", {
        ...c,
        processedAt: Date.now(),
      });
      ids.push(id);
    }
    return ids;
  },
});
