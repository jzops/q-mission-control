import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get draft by Gmail draft ID
 */
export const getByDraftId = query({
  args: { draftId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailDrafts")
      .withIndex("by_draftId", (q) => q.eq("draftId", args.draftId))
      .first();
  },
});

/**
 * Get drafts by thread ID
 */
export const getByThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailDrafts")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
  },
});

/**
 * List drafts by status
 */
export const listByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("deleted")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("emailDrafts")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc");

    if (args.limit) {
      return await q.take(args.limit);
    }
    return await q.collect();
  },
});

/**
 * Get draft statistics
 */
export const getStats = query({
  args: {
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const since = args.since || Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Collect all drafts and filter by date
    // Note: Could be optimized with a createdAt index if needed
    const drafts = await ctx.db.query("emailDrafts").collect();
    const recentDrafts = drafts.filter((d) => d.createdAt >= since);

    const withScores = recentDrafts.filter((d) => d.toneMatchScore !== undefined);
    const avgScore = withScores.length > 0
      ? withScores.reduce((sum, d) => sum + (d.toneMatchScore || 0), 0) / withScores.length
      : 0;

    return {
      total: recentDrafts.length,
      pending: recentDrafts.filter((d) => d.status === "pending").length,
      sent: recentDrafts.filter((d) => d.status === "sent").length,
      deleted: recentDrafts.filter((d) => d.status === "deleted").length,
      avgToneMatchScore: avgScore,
    };
  },
});

/**
 * Create draft record
 */
export const create = mutation({
  args: {
    draftId: v.string(),
    threadId: v.string(),
    originalEmailId: v.string(),
    toneMatchScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("emailDrafts", {
      draftId: args.draftId,
      threadId: args.threadId,
      originalEmailId: args.originalEmailId,
      status: "pending",
      toneMatchScore: args.toneMatchScore,
      createdAt: Date.now(),
    });
  },
});

/**
 * Update draft status
 */
export const updateStatus = mutation({
  args: {
    draftId: v.string(),
    status: v.union(v.literal("pending"), v.literal("sent"), v.literal("deleted")),
  },
  handler: async (ctx, args) => {
    const draft = await ctx.db
      .query("emailDrafts")
      .withIndex("by_draftId", (q) => q.eq("draftId", args.draftId))
      .first();

    if (!draft) {
      throw new Error(`Draft not found: ${args.draftId}`);
    }

    const updates: { status: "pending" | "sent" | "deleted"; sentAt?: number } = {
      status: args.status,
    };

    if (args.status === "sent") {
      updates.sentAt = Date.now();
    }

    await ctx.db.patch(draft._id, updates);
    return draft._id;
  },
});

/**
 * Mark draft as sent
 */
export const markSent = mutation({
  args: { draftId: v.string() },
  handler: async (ctx, args) => {
    const draft = await ctx.db
      .query("emailDrafts")
      .withIndex("by_draftId", (q) => q.eq("draftId", args.draftId))
      .first();

    if (!draft) {
      throw new Error(`Draft not found: ${args.draftId}`);
    }

    await ctx.db.patch(draft._id, {
      status: "sent",
      sentAt: Date.now(),
    });

    return draft._id;
  },
});

/**
 * Delete draft record
 */
export const remove = mutation({
  args: { draftId: v.string() },
  handler: async (ctx, args) => {
    const draft = await ctx.db
      .query("emailDrafts")
      .withIndex("by_draftId", (q) => q.eq("draftId", args.draftId))
      .first();

    if (draft) {
      await ctx.db.delete(draft._id);
      return true;
    }
    return false;
  },
});
