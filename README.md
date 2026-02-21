# 🚀 Mission Control

Your OpenClaw command center — a custom dashboard to track what you and your AI are working on.

Built with **Next.js 15** + **Convex** + **Tailwind CSS**.

Inspired by [Alex Finn's Mission Control framework](https://x.com/alexfinn/status/2024169334344679783).

## Features

### ✅ Tasks Board
Kanban-style task management shared between you and Q. Drag and drop to update status.

### 📝 Content Pipeline
Track content from idea → script → thumbnail → filming → editing → published.

### 📅 Calendar
Visualize scheduled tasks, cron jobs, and meetings in one place.

### 🧠 Memory
Searchable memory bank with categories and tags. See everything Q remembers.

### 👥 Team
Digital org chart for your sub-agents. Define roles and responsibilities.

### 🏢 Office
Fun visualization of agents working at their virtual desks.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Convex
```bash
npx convex dev
```
This will create your Convex project and give you a deployment URL.

### 3. Configure environment
Copy `.env.local.example` to `.env.local` and add your Convex URL:
```
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### 4. Run the app
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to any static host (Vercel, Netlify, etc.) with:
```bash
npm run build
```

Or deploy to **Replit** (preferred):
1. Import the project
2. Add environment variables
3. Run `npx convex deploy` for production Convex backend
4. Deploy!

## Integration with OpenClaw

Q can interact with Mission Control through the Convex API:

```typescript
// Create a task from Q
await ctx.db.insert("tasks", {
  title: "Review PR #42",
  assignee: "ai",
  status: "todo",
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

// Log a memory
await ctx.db.insert("memories", {
  title: "Learned about Joe's preference",
  content: "Joe prefers short, direct responses without filler.",
  category: "preferences",
  createdAt: Date.now(),
});
```

## License

MIT
