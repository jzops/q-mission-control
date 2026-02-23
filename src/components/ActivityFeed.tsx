"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const typeIcons: Record<string, string> = {
  task_started: "🚀",
  task_completed: "✅",
  email_drafted: "📧",
  memory_added: "🧠",
  cron_executed: "⏰",
  heartbeat: "💓",
  session_started: "🔌",
  error: "❌",
  info: "ℹ️",
};

const typeColors: Record<string, string> = {
  task_started: "text-blue-400",
  task_completed: "text-green-400",
  email_drafted: "text-yellow-400",
  memory_added: "text-purple-400",
  cron_executed: "text-orange-400",
  heartbeat: "text-green-400",
  session_started: "text-cyan-400",
  error: "text-red-400",
  info: "text-gray-400",
};

export function ActivityFeed({ limit = 10 }: { limit?: number }) {
  const activities = useQuery(api.activity.list, { limit });

  if (!activities) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-3xl mb-2">📊</p>
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activities.map((activity, index) => (
        <div
          key={activity._id}
          className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all duration-200 animate-fadeIn"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="text-2xl flex-shrink-0">
            {typeIcons[activity.type] || "📝"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${typeColors[activity.type] || "text-white"}`}>
                {activity.action}
              </span>
              {activity.agentName && (
                <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                  {activity.agentName}
                </span>
              )}
            </div>
            {activity.details && (
              <p className="text-xs text-gray-400 mt-1 truncate">{activity.details}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formatTimestamp(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivitySparkline({ hours = 24 }: { hours?: number }) {
  const data = useQuery(api.activity.getActivityByHour, { hours });
  
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((d, i) => (
        <div
          key={i}
          className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t w-1.5 transition-all duration-300 hover:from-blue-500 hover:to-purple-500"
          style={{ height: `${Math.max((d.count / max) * 100, 4)}%` }}
          title={`${d.count} activities ${d.hour}h ago`}
        />
      ))}
    </div>
  );
}

function formatTimestamp(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  
  return new Date(ts).toLocaleDateString();
}
