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

  // Calendar Events
  events: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("task"),
      v.literal("cron"),
      v.literal("meeting"),
      v.literal("birthday"),
      v.literal("deadline"),
      v.literal("reminder")
    ),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    recurring: v.optional(v.string()),
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
    source: v.optional(v.string()),
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

  // Cron Jobs - NEW
  cronJobs: defineTable({
    name: v.string(),
    schedule: v.string(), // cron expression
    description: v.optional(v.string()),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("failed")),
    lastOutput: v.optional(v.string()),
    runCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_nextRun", ["nextRun"]),

  // People / Contacts - NEW
  people: defineTable({
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
    lastContact: v.optional(v.number()),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_relationship", ["relationship"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["relationship"],
    }),

  // Activity log - ENHANCED
  activity: defineTable({
    agentId: v.optional(v.id("agents")),
    agentName: v.optional(v.string()), // For when we don't have an agent ID
    type: v.union(
      v.literal("task_started"),
      v.literal("task_completed"),
      v.literal("email_drafted"),
      v.literal("memory_added"),
      v.literal("cron_executed"),
      v.literal("heartbeat"),
      v.literal("session_started"),
      v.literal("error"),
      v.literal("info")
    ),
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.string()), // JSON string for flexible data
    timestamp: v.number(),
  }).index("by_agent", ["agentId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"]),

  // System Status - NEW
  systemStatus: defineTable({
    key: v.string(), // "q_status", "last_heartbeat", etc.
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),
});
