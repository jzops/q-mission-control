import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    relationship: v.optional(v.union(
      v.literal("family"),
      v.literal("team"),
      v.literal("client"),
      v.literal("contact")
    )),
  },
  handler: async (ctx, { relationship }) => {
    if (relationship) {
      return await ctx.db
        .query("people")
        .withIndex("by_relationship", (q) => q.eq("relationship", relationship))
        .collect();
    }
    return await ctx.db.query("people").order("desc").collect();
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    return await ctx.db
      .query("people")
      .withSearchIndex("search_name", (q) => q.search("name", query))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("people") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    relationship: v.union(
      v.literal("family"),
      v.literal("team"),
      v.literal("client"),
      v.literal("contact")
    ),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    birthday: v.optional(v.number()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("people", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("people"),
    name: v.optional(v.string()),
    relationship: v.optional(v.union(
      v.literal("family"),
      v.literal("team"),
      v.literal("client"),
      v.literal("contact")
    )),
    company: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    notes: v.optional(v.string()),
    birthday: v.optional(v.number()),
    lastContact: v.optional(v.number()),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    return await ctx.db.patch(id, filtered);
  },
});

export const recordContact = mutation({
  args: { id: v.id("people") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { lastContact: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("people") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const getUpcomingBirthdays = query({
  args: { days: v.number() },
  handler: async (ctx, { days }) => {
    const people = await ctx.db.query("people").collect();
    const now = new Date();
    const upcoming: typeof people = [];
    
    for (const person of people) {
      if (!person.birthday) continue;
      const bday = new Date(person.birthday);
      const thisYearBday = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
      if (thisYearBday < now) {
        thisYearBday.setFullYear(now.getFullYear() + 1);
      }
      const daysUntil = Math.floor((thisYearBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil <= days) {
        upcoming.push(person);
      }
    }
    return upcoming;
  },
});
