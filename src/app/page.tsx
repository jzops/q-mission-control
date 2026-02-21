"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";

export default function Dashboard() {
  const tasks = useQuery(api.tasks.list);
  const content = useQuery(api.content.list);
  const events = useQuery(api.events.listUpcoming, { days: 7 });
  const agents = useQuery(api.agents.list);
  const memories = useQuery(api.memories.list, { limit: 5 });

  const todoTasks = tasks?.filter((t) => t.status === "todo").length ?? 0;
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress").length ?? 0;
  const workingAgents = agents?.filter((a) => a.status === "working").length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Welcome back, Joe</h2>
        <p className="text-gray-400">Here's what's happening with your OpenClaw today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tasks To Do"
          value={todoTasks}
          icon="📋"
          color="blue"
          href="/tasks"
        />
        <StatCard
          title="In Progress"
          value={inProgressTasks}
          icon="⚡"
          color="yellow"
          href="/tasks"
        />
        <StatCard
          title="Agents Working"
          value={workingAgents}
          icon="🤖"
          color="green"
          href="/team"
        />
        <StatCard
          title="Upcoming Events"
          value={events?.length ?? 0}
          icon="📅"
          color="purple"
          href="/calendar"
        />
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Tasks</h3>
            <Link href="/tasks" className="text-blue-400 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {tasks?.slice(0, 5).map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    task.status === "done" ? "bg-green-500" :
                    task.status === "in_progress" ? "bg-yellow-500" : "bg-gray-500"
                  }`}></span>
                  <span className="text-sm">{task.title}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  task.assignee === "ai" ? "bg-purple-900 text-purple-300" : "bg-blue-900 text-blue-300"
                }`}>
                  {task.assignee === "ai" ? "🤖 Q" : "👤 Joe"}
                </span>
              </div>
            )) ?? (
              <p className="text-gray-500 text-sm">No tasks yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Events</h3>
            <Link href="/calendar" className="text-blue-400 text-sm hover:underline">
              View calendar
            </Link>
          </div>
          <div className="space-y-3">
            {events?.slice(0, 5).map((event) => (
              <div
                key={event._id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span>{event.type === "cron" ? "🔄" : event.type === "meeting" ? "👥" : "✅"}</span>
                  <div>
                    <span className="text-sm block">{event.title}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(event.startTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )) ?? (
              <p className="text-gray-500 text-sm">No upcoming events</p>
            )}
          </div>
        </div>

        {/* Recent Memories */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Memories</h3>
            <Link href="/memory" className="text-blue-400 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {memories?.slice(0, 4).map((memory) => (
              <div
                key={memory._id}
                className="p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{memory.title}</span>
                  {memory.category && (
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                      {memory.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {memory.content}
                </p>
              </div>
            )) ?? (
              <p className="text-gray-500 text-sm">No memories yet</p>
            )}
          </div>
        </div>

        {/* Team Status */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Team Status</h3>
            <Link href="/team" className="text-blue-400 text-sm hover:underline">
              Manage team
            </Link>
          </div>
          <div className="space-y-3">
            {agents?.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.avatar || "🤖"}</span>
                  <div>
                    <span className="text-sm block font-medium">{agent.name}</span>
                    <span className="text-xs text-gray-400">{agent.role}</span>
                  </div>
                </div>
                <span className={`w-2 h-2 rounded-full ${
                  agent.status === "working" ? "bg-green-500 animate-pulse" :
                  agent.status === "idle" ? "bg-yellow-500" : "bg-gray-500"
                }`}></span>
              </div>
            )) ?? (
              <p className="text-gray-500 text-sm">No agents configured</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  href,
}: {
  title: string;
  value: number;
  icon: string;
  color: "blue" | "yellow" | "green" | "purple";
  href: string;
}) {
  const colorClasses = {
    blue: "bg-blue-900/50 border-blue-800",
    yellow: "bg-yellow-900/50 border-yellow-800",
    green: "bg-green-900/50 border-green-800",
    purple: "bg-purple-900/50 border-purple-800",
  };

  return (
    <Link
      href={href}
      className={`p-5 rounded-xl border ${colorClasses[color]} hover:brightness-110 transition-all`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </Link>
  );
}
