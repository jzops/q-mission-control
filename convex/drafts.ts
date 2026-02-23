import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all drafts, ordered by createdAt desc
export const list = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("edited"),
      v.literal("discarded")
    )),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("drafts").order("desc");
    
    if (args.status) {
      q = ctx.db.query("drafts")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc");
    }
    
    const drafts = await q.take(args.limit ?? 50);
    return drafts;
  },
});

// List only pending drafts
export const listPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("drafts")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .collect();
  },
});

// Get pending count for badge
export const getPendingCount = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("drafts")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return { total: pending.length };
  },
});

// Get a single draft by ID
export const get = query({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create a new draft
export const create = mutation({
  args: {
    subject: v.string(),
    to: v.string(),
    body: v.string(),
    threadId: v.optional(v.string()),
    messageId: v.optional(v.string()),
    gmailDraftId: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("client"),
      v.literal("internal"),
      v.literal("personal"),
      v.literal("other")
    )),
    priority: v.optional(v.union(v.literal("urgent"), v.literal("normal"), v.literal("low"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("drafts", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

// Update a draft (edit content)
export const update = mutation({
  args: {
    id: v.id("drafts"),
    subject: v.optional(v.string()),
    to: v.optional(v.string()),
    body: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("client"),
      v.literal("internal"),
      v.literal("personal"),
      v.literal("other")
    )),
    priority: v.optional(v.union(v.literal("urgent"), v.literal("normal"), v.literal("low"))),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Draft not found");
    
    // Mark as edited if it was pending
    const status = existing.status === "pending" ? "edited" : existing.status;
    
    await ctx.db.patch(id, {
      ...updates,
      status,
    });
    return id;
  },
});

// Mark draft as sent
export const markSent = mutation({
  args: {
    id: v.id("drafts"),
    gmailDraftId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: Date.now(),
      ...(args.gmailDraftId && { gmailDraftId: args.gmailDraftId }),
    });
    return args.id;
  },
});

// Discard a draft
export const discard = mutation({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "discarded",
    });
    return args.id;
  },
});

// Delete a draft permanently
export const remove = mutation({
  args: { id: v.id("drafts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return args.id;
  },
});

// Bulk operations
export const discardAll = mutation({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("drafts")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    
    for (const draft of pending) {
      await ctx.db.patch(draft._id, { status: "discarded" });
    }
    
    return { discarded: pending.length };
  },
});
