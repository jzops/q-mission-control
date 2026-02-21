import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tasks Board
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    assignee: v.union(v.literal("human"), v.literal("ai")),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_assignee", ["assignee"]),

  // Content Pipeline
  content: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    stage: v.union(
      v.literal("idea"),
      v.literal("script"),
      v.literal("thumbnail"),
      v.literal("filming"),
      v.literal("editing"),
      v.literal("published")
    ),
    script: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    publishedUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_stage", ["stage"]),

  // Calendar Events (scheduled tasks & cron jobs)
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("task"), v.literal("cron"), v.literal("meeting")),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    recurring: v.optional(v.string()), // cron expression if recurring
    completed: v.boolean(),
    createdAt: v.number(),
  }).index("by_start", ["startTime"])
    .index("by_type", ["type"]),

  // Memory entries
  memories: defineTable({
    title: v.string(),
    content: v.string(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    source: v.optional(v.string()), // conversation, observation, etc.
    createdAt: v.number(),
  }).index("by_category", ["category"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["category"],
    }),

  // Team / Agents
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    responsibilities: v.array(v.string()),
    status: v.union(v.literal("idle"), v.literal("working"), v.literal("offline")),
    currentTask: v.optional(v.string()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_role", ["role"])
    .index("by_status", ["status"]),

  // Activity log for the Office view
  activity: defineTable({
    agentId: v.id("agents"),
    action: v.string(),
    details: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_agent", ["agentId"])
    .index("by_timestamp", ["timestamp"]),
});
