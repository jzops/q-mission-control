import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// List opportunities
export const list = query({
  args: {
    stage: v.optional(v.string()),
    owner: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { stage, owner, limit = 100 }) => {
    let results = await ctx.db.query("opportunities").order("desc").take(limit);
    
    if (stage) {
      results = results.filter(o => o.stage === stage);
    }
    if (owner) {
      results = results.filter(o => o.owner === owner);
    }
    
    return results;
  },
});

// Get pipeline summary
export const getPipelineSummary = query({
  args: {},
  handler: async (ctx) => {
    const opps = await ctx.db.query("opportunities").collect();
    
    const stages = ["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"];
    const byStage: Record<string, { count: number; value: number; weighted: number }> = {};
    
    for (const stage of stages) {
      const stageOpps = opps.filter(o => o.stage === stage);
      byStage[stage] = {
        count: stageOpps.length,
        value: stageOpps.reduce((sum, o) => sum + o.value, 0),
        weighted: stageOpps.reduce((sum, o) => sum + (o.value * o.probability / 100), 0),
      };
    }
    
    const activeOpps = opps.filter(o => !["closed_won", "closed_lost"].includes(o.stage));
    
    return {
      totalPipeline: activeOpps.reduce((sum, o) => sum + o.value, 0),
      weightedPipeline: activeOpps.reduce((sum, o) => sum + (o.value * o.probability / 100), 0),
      totalDeals: activeOpps.length,
      closedWonThisQuarter: byStage.closed_won?.value || 0,
      byStage,
    };
  },
});

// Create opportunity
export const create = mutation({
  args: {
    name: v.string(),
    stage: v.union(
      v.literal("lead"),
      v.literal("qualified"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("closed_won"),
      v.literal("closed_lost")
    ),
    value: v.number(),
    probability: v.number(),
    expectedClose: v.optional(v.number()),
    owner: v.string(),
    source: v.optional(v.string()),
    externalId: v.optional(v.string()),
    contact: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("opportunities", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update opportunity stage
export const updateStage = mutation({
  args: {
    id: v.id("opportunities"),
    stage: v.union(
      v.literal("lead"),
      v.literal("qualified"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("closed_won"),
      v.literal("closed_lost")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, stage, notes }) => {
    const updates: any = { stage, updatedAt: Date.now(), lastActivity: Date.now() };
    if (notes) updates.notes = notes;
    
    // Update probability based on stage
    const stageProbabilities: Record<string, number> = {
      lead: 10,
      qualified: 25,
      proposal: 50,
      negotiation: 75,
      closed_won: 100,
      closed_lost: 0,
    };
    updates.probability = stageProbabilities[stage];
    
    await ctx.db.patch(id, updates);
  },
});

// Update opportunity
export const update = mutation({
  args: {
    id: v.id("opportunities"),
    name: v.optional(v.string()),
    value: v.optional(v.number()),
    probability: v.optional(v.number()),
    expectedClose: v.optional(v.number()),
    owner: v.optional(v.string()),
    contact: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, { ...filtered, updatedAt: Date.now() });
  },
});

// Bulk upsert (for syncing from Vasco/external sources)
export const bulkUpsert = mutation({
  args: {
    opportunities: v.array(v.object({
      name: v.string(),
      stage: v.string(),
      value: v.number(),
      probability: v.number(),
      expectedClose: v.optional(v.number()),
      owner: v.string(),
      source: v.string(),
      externalId: v.string(),
      contact: v.optional(v.string()),
      notes: v.optional(v.string()),
    })),
  },
  handler: async (ctx, { opportunities }) => {
    let created = 0;
    let updated = 0;
    
    for (const opp of opportunities) {
      // Check if exists by externalId
      const existing = await ctx.db
        .query("opportunities")
        .filter((q) => q.eq(q.field("externalId"), opp.externalId))
        .first();
      
      if (existing) {
        await ctx.db.patch(existing._id, {
          ...opp,
          stage: opp.stage as any,
          updatedAt: Date.now(),
        });
        updated++;
      } else {
        await ctx.db.insert("opportunities", {
          ...opp,
          stage: opp.stage as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        created++;
      }
    }
    
    return { created, updated };
  },
});

// Delete opportunity
export const remove = mutation({
  args: { id: v.id("opportunities") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

// Search opportunities
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query }) => {
    return await ctx.db
      .query("opportunities")
      .withSearchIndex("search_name", (q) => q.search("name", query))
      .take(20);
  },
});
