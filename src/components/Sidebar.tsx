"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/tasks", label: "Tasks", icon: "✅" },
  { href: "/crons", label: "Cron Jobs", icon: "⏰" },
  { href: "/people", label: "People", icon: "👤" },
  { href: "/content", label: "Content", icon: "📝" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/memory", label: "Memory", icon: "🧠" },
  { href: "/team", label: "Team", icon: "👥" },
  { href: "/office", label: "Office", icon: "🏢" },
];

export function Sidebar() {
  const pathname = usePathname();
  const systemStatus = useQuery(api.systemStatus.getAll);
  
  const lastHeartbeat = systemStatus?.last_heartbeat?.value 
    ? parseInt(systemStatus.last_heartbeat.value) 
    : null;
  const qStatus = systemStatus?.q_status?.value || "offline";
  const currentTask = systemStatus?.current_task?.value;
  
  const isOnline = lastHeartbeat && (Date.now() - lastHeartbeat) < 5 * 60 * 1000; // 5 min threshold
  
  const timeSinceHeartbeat = lastHeartbeat 
    ? formatTimeAgo(Date.now() - lastHeartbeat)
    : "Never";

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="animate-pulse">⚡</span>
          <span>Mission Control</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Q's Command Center</p>
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Q Status Card */}
      <div className="mt-auto">
        <div className={`rounded-xl p-4 border transition-all duration-500 ${
          isOnline 
            ? "bg-gradient-to-br from-green-900/50 to-gray-900 border-green-800" 
            : "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`relative w-3 h-3 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}>
              {isOnline && (
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
              )}
            </div>
            <span className="text-sm font-medium text-white">
              Q {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Last seen: {timeSinceHeartbeat}</p>
            {currentTask && isOnline && (
              <p className="text-green-400 truncate">📌 {currentTask}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function formatTimeAgo(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
