import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all sessions
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 30 }) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_date")
      .order("desc")
      .take(limit);
  },
});

// Get session by date
export const getByDate = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    return await ctx.db
      .query("sessions")
      .withIndex("by_date", (q) => q.eq("date", date))
      .first();
  },
});

// Get or create today's session
export const getOrCreateToday = mutation({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = await ctx.db
      .query("sessions")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    
    if (existing) return existing._id;
    
    return await ctx.db.insert("sessions", {
      date: today,
      totalActions: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update session summary
export const updateSummary = mutation({
  args: {
    id: v.id("sessions"),
    summary: v.string(),
    categories: v.optional(v.string()),
  },
  handler: async (ctx, { id, summary, categories }) => {
    await ctx.db.patch(id, {
      summary,
      categories,
      updatedAt: Date.now(),
    });
  },
});

// Get entries for a session/date
export const getEntries = query({
  args: { 
    date: v.optional(v.string()),
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { date, type, limit = 50 }) => {
    let query = ctx.db.query("sessionEntries");
    
    if (date) {
      query = query.withIndex("by_date", (q) => q.eq("date", date));
    } else {
      query = query.withIndex("by_timestamp");
    }
    
    const entries = await query.order("desc").take(limit);
    
    if (type) {
      return entries.filter(e => e.type === type);
    }
    return entries;
  },
});

// Log a session entry
export const logEntry = mutation({
  args: {
    type: v.union(
      v.literal("email"),
      v.literal("coding"),
      v.literal("research"),
      v.literal("automation"),
      v.literal("communication"),
      v.literal("memory"),
      v.literal("other")
    ),
    action: v.string(),
    reasoning: v.optional(v.string()),
    outcome: v.optional(v.string()),
    duration: v.optional(v.number()),
    relatedTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0];
    
    // Get or create today's session
    let session = await ctx.db
      .query("sessions")
      .withIndex("by_date", (q) => q.eq("date", today))
      .first();
    
    if (!session) {
      const sessionId = await ctx.db.insert("sessions", {
        date: today,
        totalActions: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      session = await ctx.db.get(sessionId);
    }
    
    // Create entry
    const entryId = await ctx.db.insert("sessionEntries", {
      sessionId: session!._id,
      date: today,
      ...args,
      timestamp: Date.now(),
    });
    
    // Update session count
    await ctx.db.patch(session!._id, {
      totalActions: (session!.totalActions || 0) + 1,
      updatedAt: Date.now(),
    });
    
    return entryId;
  },
});

// Get session stats
export const getStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days = 7 }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_date")
      .order("desc")
      .take(days);
    
    const totalActions = sessions.reduce((sum, s) => sum + (s.totalActions || 0), 0);
    
    return {
      sessionCount: sessions.length,
      totalActions,
      avgActionsPerDay: sessions.length > 0 ? Math.round(totalActions / sessions.length) : 0,
    };
  },
});
