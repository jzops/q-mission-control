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

  // Cron Jobs
  cronJobs: defineTable({
    name: v.string(),
    schedule: v.string(),
    description: v.optional(v.string()),
    lastRun: v.optional(v.number()),
    nextRun: v.optional(v.number()),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("failed")),
    lastOutput: v.optional(v.string()),
    runCount: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_status", ["status"])
    .index("by_nextRun", ["nextRun"]),

  // People / Contacts
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

  // Activity log
  activity: defineTable({
    agentId: v.optional(v.id("agents")),
    agentName: v.optional(v.string()),
    type: v.union(
      v.literal("task_started"),
      v.literal("task_completed"),
      v.literal("email_drafted"),
      v.literal("memory_added"),
      v.literal("cron_executed"),
      v.literal("heartbeat"),
      v.literal("session_started"),
      v.literal("decision_made"),
      v.literal("approval_requested"),
      v.literal("question_asked"),
      v.literal("error"),
      v.literal("info")
    ),
    action: v.string(),
    details: v.optional(v.string()),
    metadata: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_agent", ["agentId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type"]),

  // System Status
  systemStatus: defineTable({
    key: v.string(),
    value: v.string(),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // ============ PHASE 1: VISIBILITY & TRUST ============

  // Session Log - What Q did while you were away
  sessions: defineTable({
    date: v.string(), // YYYY-MM-DD
    summary: v.optional(v.string()), // AI-generated summary of the day
    totalActions: v.optional(v.number()),
    categories: v.optional(v.string()), // JSON: {email: 3, coding: 2, research: 1}
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_date", ["date"]),

  // Session Entries - Individual actions within a session
  sessionEntries: defineTable({
    sessionId: v.optional(v.id("sessions")),
    date: v.string(), // YYYY-MM-DD for querying without session
    type: v.union(
      v.literal("email"),
      v.literal("coding"),
      v.literal("research"),
      v.literal("automation"),
      v.literal("communication"),
      v.literal("memory"),
      v.literal("other")
    ),
    action: v.string(), // What was done
    reasoning: v.optional(v.string()), // Why it was done
    outcome: v.optional(v.string()), // What happened
    duration: v.optional(v.number()), // Minutes spent
    relatedTo: v.optional(v.string()), // Project/person/task this relates to
    timestamp: v.number(),
  }).index("by_session", ["sessionId"])
    .index("by_date", ["date"])
    .index("by_type", ["type"])
    .index("by_timestamp", ["timestamp"]),

  // Decisions Log - Autonomous decisions Q made
  decisions: defineTable({
    title: v.string(), // Short description
    description: v.string(), // What was decided
    alternatives: v.optional(v.string()), // JSON array of alternatives considered
    reasoning: v.string(), // Why this choice was made
    category: v.union(
      v.literal("email"),
      v.literal("scheduling"),
      v.literal("prioritization"),
      v.literal("communication"),
      v.literal("technical"),
      v.literal("other")
    ),
    impact: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    feedback: v.optional(v.union(v.literal("good"), v.literal("bad"), v.literal("neutral"))),
    feedbackNote: v.optional(v.string()),
    reviewed: v.boolean(),
    timestamp: v.number(),
  }).index("by_reviewed", ["reviewed"])
    .index("by_feedback", ["feedback"])
    .index("by_timestamp", ["timestamp"])
    .index("by_category", ["category"]),

  // Questions Queue - Things Q wants to ask
  questions: defineTable({
    question: v.string(),
    context: v.optional(v.string()), // Background info
    category: v.union(
      v.literal("clarification"),
      v.literal("permission"),
      v.literal("preference"),
      v.literal("decision"),
      v.literal("feedback"),
      v.literal("other")
    ),
    priority: v.union(v.literal("urgent"), v.literal("normal"), v.literal("low")),
    status: v.union(v.literal("pending"), v.literal("answered"), v.literal("dismissed")),
    answer: v.optional(v.string()),
    answeredAt: v.optional(v.number()),
    relatedTo: v.optional(v.string()), // What this question is about
    timestamp: v.number(),
  }).index("by_status", ["status"])
    .index("by_priority", ["priority"])
    .index("by_timestamp", ["timestamp"]),

  // Approvals Queue - Things waiting for human approval
  approvals: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("email_send"),
      v.literal("social_post"),
      v.literal("purchase"),
      v.literal("external_action"),
      v.literal("code_deploy"),
      v.literal("other")
    ),
    content: v.optional(v.string()), // The actual content (email body, tweet, etc)
    metadata: v.optional(v.string()), // JSON with additional data
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    priority: v.union(v.literal("urgent"), v.literal("normal"), v.literal("low")),
    feedback: v.optional(v.string()), // Human's note on why approved/rejected
    decidedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()), // Auto-expire if not acted on
    timestamp: v.number(),
  }).index("by_status", ["status"])
    .index("by_type", ["type"])
    .index("by_priority", ["priority"])
    .index("by_timestamp", ["timestamp"]),

  // Lessons Learned - Feedback-driven learning
  lessons: defineTable({
    title: v.string(),
    description: v.string(), // What happened
    lesson: v.string(), // What was learned
    category: v.union(
      v.literal("communication"),
      v.literal("technical"),
      v.literal("prioritization"),
      v.literal("style"),
      v.literal("process"),
      v.literal("other")
    ),
    source: v.union(
      v.literal("feedback"),
      v.literal("correction"),
      v.literal("observation"),
      v.literal("explicit")
    ),
    applied: v.boolean(), // Has this been incorporated into behavior?
    timestamp: v.number(),
  }).index("by_category", ["category"])
    .index("by_applied", ["applied"])
    .index("by_timestamp", ["timestamp"]),

  // ============ EMAIL DRAFTS QUEUE ============
  
  // Email drafts created by Q, pending review/send
  drafts: defineTable({
    subject: v.string(),
    to: v.string(),
    body: v.string(),
    threadId: v.optional(v.string()), // Gmail thread ID if reply
    messageId: v.optional(v.string()), // Gmail message ID of draft
    gmailDraftId: v.optional(v.string()), // Gmail draft resource ID
    status: v.union(
      v.literal("pending"),
      v.literal("sent"),
      v.literal("edited"),
      v.literal("discarded")
    ),
    category: v.optional(v.union(
      v.literal("client"),
      v.literal("internal"),
      v.literal("personal"),
      v.literal("other")
    )),
    priority: v.optional(v.union(v.literal("urgent"), v.literal("normal"), v.literal("low"))),
    createdAt: v.number(),
    sentAt: v.optional(v.number()),
  }).index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_priority", ["priority"]),

  // ============ PHASE 2: BUSINESS METRICS ============

  // OKRs - Objectives and Key Results
  okrs: defineTable({
    objective: v.string(), // The objective
    keyResults: v.array(v.object({
      description: v.string(),
      target: v.number(),
      current: v.number(),
      unit: v.string(), // "$", "%", "count", etc.
    })),
    quarter: v.string(), // "Q1 2026"
    status: v.union(v.literal("on_track"), v.literal("at_risk"), v.literal("behind"), v.literal("achieved")),
    owner: v.string(), // "Joe", "Jake", "Team"
    notes: v.optional(v.string()),
    updatedAt: v.number(),
    createdAt: v.number(),
  }).index("by_quarter", ["quarter"])
    .index("by_status", ["status"])
    .index("by_owner", ["owner"]),

  // Opportunities - Sales Pipeline
  opportunities: defineTable({
    name: v.string(), // Company/deal name
    stage: v.union(
      v.literal("lead"),
      v.literal("qualified"),
      v.literal("proposal"),
      v.literal("negotiation"),
      v.literal("closed_won"),
      v.literal("closed_lost")
    ),
    value: v.number(), // Deal value in dollars
    probability: v.number(), // 0-100
    expectedClose: v.optional(v.number()), // Timestamp
    owner: v.string(), // Sales rep
    source: v.optional(v.string()), // "Vasco", "Manual", "HubSpot"
    externalId: v.optional(v.string()), // ID from source system
    contact: v.optional(v.string()), // Primary contact name
    notes: v.optional(v.string()),
    lastActivity: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_stage", ["stage"])
    .index("by_owner", ["owner"])
    .index("by_expectedClose", ["expectedClose"])
    .searchIndex("search_name", {
      searchField: "name",
    }),
});
