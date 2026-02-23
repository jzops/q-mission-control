"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Link from "next/link";
import { ActivityFeed, ActivitySparkline } from "../components/ActivityFeed";
import { useEffect, useState } from "react";

interface ProfitData {
  mrr: string;
  profit: string;
  margin: string;
  target: string;
  trending?: string;
}

export default function Dashboard() {
  const tasks = useQuery(api.tasks.list);
  const events = useQuery(api.events.listUpcoming, { days: 7 });
  const agents = useQuery(api.agents.list);
  const memories = useQuery(api.memories.list, { limit: 5 });
  const cronJobs = useQuery(api.cronJobs.listActive);
  const systemStatus = useQuery(api.systemStatus.getAll);
  const recentActivityCount = useQuery(api.activity.getRecentCount, { hours: 24 });

  const [profitData, setProfitData] = useState<ProfitData | null>(null);

  // Fetch profit data from Google Sheet
  useEffect(() => {
    fetch('/api/profit')
      .then(res => res.json())
      .then(data => {
        if (data.success) setProfitData(data.data);
      })
      .catch(console.error);
  }, []);

  const todoTasks = tasks?.filter((t) => t.status === "todo").length ?? 0;
  const inProgressTasks = tasks?.filter((t) => t.status === "in_progress").length ?? 0;
  const workingAgents = agents?.filter((a) => a.status === "working").length ?? 0;
  const activeCrons = cronJobs?.length ?? 0;

  const lastHeartbeat = systemStatus?.last_heartbeat?.value 
    ? parseInt(systemStatus.last_heartbeat.value) 
    : null;
  const currentTask = systemStatus?.current_task?.value;
  const isOnline = lastHeartbeat && (Date.now() - lastHeartbeat) < 5 * 60 * 1000;

  return (
    <div className="space-y-6">
      {/* Header with Q Status */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome back, Joe</h2>
          <p className="text-gray-400">Here's what Q is working on today.</p>
        </div>
        
        {/* Q Status Card */}
        <div className={`px-5 py-4 rounded-xl border transition-all ${
          isOnline 
            ? "bg-gradient-to-br from-green-900/50 to-gray-900 border-green-700" 
            : "bg-gray-900 border-gray-700"
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                isOnline ? "bg-green-900/50" : "bg-gray-800"
              }`}>
                ⚡
              </div>
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-gray-900 ${
                isOnline ? "bg-green-500" : "bg-gray-500"
              }`}>
                {isOnline && (
                  <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50"></div>
                )}
              </div>
            </div>
            <div>
              <p className="font-semibold">Q is {isOnline ? "Online" : "Offline"}</p>
              {currentTask && isOnline && (
                <p className="text-sm text-green-400 max-w-[200px] truncate">📌 {currentTask}</p>
              )}
              {lastHeartbeat && (
                <p className="text-xs text-gray-500">Last seen {formatTimeAgo(Date.now() - lastHeartbeat)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity + Profit Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity Sparkline */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Activity (24h)</h3>
              <p className="text-sm text-gray-400">{recentActivityCount || 0} actions</p>
            </div>
            <div className="text-right">
              <ActivitySparkline hours={24} />
            </div>
          </div>
        </div>

        {/* Profit Tracker */}
        <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 rounded-xl p-4 border border-green-800/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            💰 Q1 Profit
            {profitData?.trending === 'up' && <span className="text-green-400 text-xs">↑</span>}
          </h3>
          {profitData ? (
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400">Current</p>
                  <p className="text-2xl font-bold text-green-400">{profitData.profit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Target</p>
                  <p className="text-lg font-semibold text-gray-300">{profitData.target}</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{profitData.margin}</span>
                </div>
                <div className="bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: profitData.margin }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-500">MRR: {profitData.mrr}</p>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">Loading...</p>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          title="Active Crons"
          value={activeCrons}
          icon="⏰"
          color="orange"
          href="/crons"
        />
        <StatCard
          title="Agents"
          value={workingAgents}
          icon="🤖"
          color="green"
          href="/team"
        />
        <StatCard
          title="Events (7d)"
          value={events?.length ?? 0}
          icon="📅"
          color="purple"
          href="/calendar"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Activity Feed - Takes 2 columns */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="relative">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                <span className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              </span>
              Live Activity
            </h3>
          </div>
          <ActivityFeed limit={8} />
        </div>

        {/* Right Column - Tasks & Events */}
        <div className="space-y-6">
          {/* Recent Tasks */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Tasks</h3>
              <Link href="/tasks" className="text-blue-400 text-sm hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {tasks?.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.status === "done" ? "bg-green-500" :
                      task.status === "in_progress" ? "bg-yellow-500" : "bg-gray-500"
                    }`}></span>
                    <span className="text-sm truncate">{task.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded flex-shrink-0 ${
                    task.assignee === "ai" ? "bg-purple-900/50 text-purple-300" : "bg-blue-900/50 text-blue-300"
                  }`}>
                    {task.assignee === "ai" ? "🤖" : "👤"}
                  </span>
                </div>
              )) ?? (
                <p className="text-gray-500 text-sm text-center py-4">No tasks yet</p>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upcoming</h3>
              <Link href="/calendar" className="text-blue-400 text-sm hover:underline">
                Calendar
              </Link>
            </div>
            <div className="space-y-2">
              {events?.slice(0, 4).map((event) => (
                <div
                  key={event._id}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                >
                  <span className="text-lg">
                    {event.type === "cron" ? "🔄" : 
                     event.type === "meeting" ? "👥" : 
                     event.type === "birthday" ? "🎂" :
                     event.type === "deadline" ? "⚠️" :
                     event.type === "reminder" ? "🔔" : "✅"}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm block truncate">{event.title}</span>
                    <span className="text-xs text-gray-400">
                      {formatEventTime(event.startTime)}
                    </span>
                  </div>
                </div>
              )) ?? (
                <p className="text-gray-500 text-sm text-center py-4">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Memories & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
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
              <p className="text-gray-500 text-sm text-center py-4">No memories yet</p>
            )}
          </div>
        </div>

        {/* Team Status */}
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Team Status</h3>
            <Link href="/team" className="text-blue-400 text-sm hover:underline">
              Manage
            </Link>
          </div>
          <div className="space-y-3">
            {agents?.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
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
              <p className="text-gray-500 text-sm text-center py-4">No agents configured</p>
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
  color: "blue" | "yellow" | "green" | "purple" | "orange";
  href: string;
}) {
  const colorClasses = {
    blue: "bg-blue-900/30 border-blue-800 hover:border-blue-600",
    yellow: "bg-yellow-900/30 border-yellow-800 hover:border-yellow-600",
    green: "bg-green-900/30 border-green-800 hover:border-green-600",
    purple: "bg-purple-900/30 border-purple-800 hover:border-purple-600",
    orange: "bg-orange-900/30 border-orange-800 hover:border-orange-600",
  };

  return (
    <Link
      href={href}
      className={`p-4 rounded-xl border ${colorClasses[color]} hover:scale-105 transition-all duration-200`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </Link>
  );
}

function formatTimeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatEventTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === now.toDateString()) {
    return "Today " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
