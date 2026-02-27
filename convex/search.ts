import { v } from "convex/values";
import { query } from "./_generated/server";

// Global search across multiple entities
export const global = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const searchQuery = args.query.toLowerCase().trim();
    if (!searchQuery) return { results: [] };

    const limit = args.limit ?? 10;
    const results: Array<{
      type: "task" | "person" | "memory" | "decision" | "draft";
      id: string;
      title: string;
      subtitle?: string;
      href: string;
    }> = [];

    // Search tasks
    const tasks = await ctx.db.query("tasks").collect();
    for (const task of tasks) {
      if (
        task.title.toLowerCase().includes(searchQuery) ||
        task.description?.toLowerCase().includes(searchQuery)
      ) {
        results.push({
          type: "task",
          id: task._id,
          title: task.title,
          subtitle: task.status,
          href: "/tasks",
        });
      }
      if (results.length >= limit) break;
    }

    // Search people (use search index)
    if (results.length < limit) {
      try {
        const people = await ctx.db
          .query("people")
          .withSearchIndex("search_name", (q) => q.search("name", searchQuery))
          .take(limit - results.length);

        for (const person of people) {
          results.push({
            type: "person",
            id: person._id,
            title: person.name,
            subtitle: person.company,
            href: "/people",
          });
        }
      } catch {
        // Fall back to manual search if search index isn't ready
        const people = await ctx.db.query("people").collect();
        for (const person of people) {
          if (
            person.name.toLowerCase().includes(searchQuery) ||
            person.company?.toLowerCase().includes(searchQuery) ||
            person.notes?.toLowerCase().includes(searchQuery)
          ) {
            results.push({
              type: "person",
              id: person._id,
              title: person.name,
              subtitle: person.company,
              href: "/people",
            });
          }
          if (results.length >= limit) break;
        }
      }
    }

    // Search memories (use search index)
    if (results.length < limit) {
      try {
        const memories = await ctx.db
          .query("memories")
          .withSearchIndex("search_content", (q) => q.search("content", searchQuery))
          .take(limit - results.length);
        
        for (const memory of memories) {
          results.push({
            type: "memory",
            id: memory._id,
            title: memory.title,
            subtitle: memory.category,
            href: "/memory",
          });
        }
      } catch {
        // Fall back to manual search if search index isn't ready
        const memories = await ctx.db.query("memories").collect();
        for (const memory of memories) {
          if (
            memory.title.toLowerCase().includes(searchQuery) ||
            memory.content.toLowerCase().includes(searchQuery)
          ) {
            results.push({
              type: "memory",
              id: memory._id,
              title: memory.title,
              subtitle: memory.category,
              href: "/memory",
            });
          }
          if (results.length >= limit) break;
        }
      }
    }

    // Search decisions
    if (results.length < limit) {
      const decisions = await ctx.db.query("decisions").collect();
      for (const decision of decisions) {
        if (
          decision.title.toLowerCase().includes(searchQuery) ||
          decision.description.toLowerCase().includes(searchQuery)
        ) {
          results.push({
            type: "decision",
            id: decision._id,
            title: decision.title,
            subtitle: decision.category,
            href: "/decisions",
          });
        }
        if (results.length >= limit) break;
      }
    }

    // Search drafts
    if (results.length < limit) {
      const drafts = await ctx.db.query("drafts").collect();
      for (const draft of drafts) {
        if (
          draft.subject.toLowerCase().includes(searchQuery) ||
          draft.to.toLowerCase().includes(searchQuery) ||
          draft.body.toLowerCase().includes(searchQuery)
        ) {
          results.push({
            type: "draft",
            id: draft._id,
            title: draft.subject,
            subtitle: `To: ${draft.to}`,
            href: "/drafts",
          });
        }
        if (results.length >= limit) break;
      }
    }

    return { results: results.slice(0, limit) };
  },
});
