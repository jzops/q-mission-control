import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get Gmail config by user
 */
export const getConfig = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gmailConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * List all configs
 */
export const listConfigs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("gmailConfig").collect();
  },
});

/**
 * Create or update Gmail config
 */
export const upsertConfig = mutation({
  args: {
    userId: v.string(),
    enabled: v.boolean(),
    autoReplyCategories: v.optional(v.array(v.string())),
    excludedDomains: v.optional(v.array(v.string())),
    workingHours: v.optional(
      v.object({
        start: v.number(),
        end: v.number(),
        timezone: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gmailConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    const data = {
      userId: args.userId,
      enabled: args.enabled,
      autoReplyCategories: args.autoReplyCategories || ["client", "prospect"],
      excludedDomains: args.excludedDomains || [],
      workingHours: args.workingHours,
      lastSyncAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    }

    return await ctx.db.insert("gmailConfig", data);
  },
});

/**
 * Enable/disable Gmail auto-reply
 */
export const setEnabled = mutation({
  args: {
    userId: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gmailConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      // Create new config
      return await ctx.db.insert("gmailConfig", {
        userId: args.userId,
        enabled: args.enabled,
        autoReplyCategories: ["client", "prospect"],
        excludedDomains: [],
        lastSyncAt: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, { enabled: args.enabled });
    return existing._id;
  },
});

/**
 * Update auto-reply categories
 */
export const setAutoReplyCategories = mutation({
  args: {
    userId: v.string(),
    categories: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gmailConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      throw new Error(`Config not found for user: ${args.userId}`);
    }

    await ctx.db.patch(existing._id, { autoReplyCategories: args.categories });
    return existing._id;
  },
});

/**
 * Add domain to exclusion list
 */
export const addExcludedDomain = mutation({
  args: {
    userId: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gmailConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      throw new Error(`Config not found for user: ${args.userId}`);
    }

    const domains = [...existing.excludedDomains];
    if (!domains.includes(args.domain)) {
      domains.push(args.domain);
    }

    await ctx.db.patch(existing._id, { excludedDomains: domains });
    return existing._id;
  },
});

/**
 * Remove domain from exclusion list
 */
export const removeExcludedDomain = mutation({
  args: {
    userId: v.string(),
    domain: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gmailConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      throw new Error(`Config not found for user: ${args.userId}`);
    }

    const domains = existing.excludedDomains.filter((d) => d !== args.domain);

    await ctx.db.patch(existing._id, { excludedDomains: domains });
    return existing._id;
  },
});

/**
 * Update last sync timestamp
 */
export const updateLastSync = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gmailConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!existing) {
      throw new Error(`Config not found for user: ${args.userId}`);
    }

    await ctx.db.patch(existing._id, { lastSyncAt: Date.now() });
    return existing._id;
  },
});

/**
 * Delete config
 */
export const deleteConfig = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("gmailConfig")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});
