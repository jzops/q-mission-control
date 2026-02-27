import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get tone profile by user (Gmail address)
 */
export const getProfile = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailToneProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

/**
 * Get all tone profiles
 */
export const listProfiles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("emailToneProfiles").collect();
  },
});

/**
 * Create or update tone profile
 */
export const upsertProfile = mutation({
  args: {
    userId: v.string(),
    profileData: v.object({
      formalityLevel: v.number(),
      averageSentenceLength: v.number(),
      greetingPatterns: v.array(v.string()),
      closingPatterns: v.array(v.string()),
      commonPhrases: v.array(v.string()),
      emojiUsage: v.boolean(),
      responseLengthAvg: v.number(),
      vocabularyComplexity: v.number(),
      toneKeywords: v.array(v.string()),
    }),
    sampleCount: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("emailToneProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        profileData: args.profileData,
        sampleCount: args.sampleCount,
        lastAnalyzedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("emailToneProfiles", {
      userId: args.userId,
      profileData: args.profileData,
      sampleCount: args.sampleCount,
      lastAnalyzedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

/**
 * Delete tone profile
 */
export const deleteProfile = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("emailToneProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return true;
    }
    return false;
  },
});
