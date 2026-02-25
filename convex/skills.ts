import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// List all skills
export const list = query({
  args: {
    type: v.optional(v.union(
      v.literal("maker"),
      v.literal("sop"),
      v.literal("tool"),
      v.literal("internal")
    )),
  },
  handler: async (ctx, args) => {
    if (args.type) {
      return await ctx.db
        .query("skills")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect();
    }
    return await ctx.db.query("skills").collect();
  },
});

// Get a single skill by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const skills = await ctx.db
      .query("skills")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
    return skills[0] || null;
  },
});

// Search skills
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withSearchIndex("search_skills", (q) => q.search("name", args.query))
      .collect();
  },
});

// Create a new skill
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("maker"),
      v.literal("sop"),
      v.literal("tool"),
      v.literal("internal")
    ),
    content: v.optional(v.string()),
    repoPath: v.string(),
    hasReferences: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("skills", {
      ...args,
      lastSynced: now,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update a skill
export const update = mutation({
  args: {
    id: v.id("skills"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("maker"),
      v.literal("sop"),
      v.literal("tool"),
      v.literal("internal")
    )),
    content: v.optional(v.string()),
    hasReferences: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    return await ctx.db.patch(id, {
      ...filtered,
      updatedAt: Date.now(),
    });
  },
});

// Sync skill from repo (upsert by slug)
export const sync = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("maker"),
      v.literal("sop"),
      v.literal("tool"),
      v.literal("internal")
    ),
    content: v.optional(v.string()),
    repoPath: v.string(),
    hasReferences: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skills")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      return await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        type: args.type,
        content: args.content,
        repoPath: args.repoPath,
        hasReferences: args.hasReferences,
        lastSynced: now,
        updatedAt: now,
      });
    } else {
      return await ctx.db.insert("skills", {
        ...args,
        lastSynced: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Remove a skill
export const remove = mutation({
  args: { id: v.id("skills") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
