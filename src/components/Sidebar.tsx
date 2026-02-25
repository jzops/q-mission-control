"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { GlobalSearch } from "./GlobalSearch";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/sessions", label: "Session Log", icon: "📜", badge: "new" },
  { href: "/drafts", label: "Email Drafts", icon: "📧", badgeKey: "drafts" },
  { href: "/approvals", label: "Approvals", icon: "✋", badgeKey: "approvals" },
  { href: "/questions", label: "Questions", icon: "❓", badgeKey: "questions" },
  { href: "/decisions", label: "Decisions", icon: "🎯", badgeKey: "decisions" },
  { href: "/tasks", label: "Tasks", icon: "✅" },
  { href: "/crons", label: "Cron Jobs", icon: "⏰" },
  { href: "/people", label: "People", icon: "👤" },
  { href: "/lessons", label: "Lessons", icon: "📚", badge: "new" },
  { divider: true },
  { href: "/memory", label: "Memory", icon: "🧠" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/content", label: "Content", icon: "📝" },
  { href: "/team", label: "Team", icon: "👥" },
  { href: "/skills", label: "Skills & SOPs", icon: "📋", badge: "new" },
  { href: "/office", label: "Office", icon: "🏢" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const systemStatus = useQuery(api.systemStatus.getAll);
  const pendingApprovals = useQuery(api.approvals.getPendingCount);
  const pendingQuestions = useQuery(api.questions.getPendingCount);
  const unreviewedDecisions = useQuery(api.decisions.getUnreviewedCount);
  const pendingDrafts = useQuery(api.drafts.getPendingCount);
  
  const lastHeartbeat = systemStatus?.last_heartbeat?.value 
    ? parseInt(systemStatus.last_heartbeat.value) 
    : null;
  const currentTask = systemStatus?.current_task?.value;
  
  const isOnline = lastHeartbeat && (Date.now() - lastHeartbeat) < 5 * 60 * 1000;
  const timeSinceHeartbeat = lastHeartbeat ? formatTimeAgo(Date.now() - lastHeartbeat) : "Never";

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const getBadgeCount = (key: string) => {
    switch (key) {
      case "approvals": return pendingApprovals?.total || 0;
      case "questions": return pendingQuestions?.total || 0;
      case "decisions": return unreviewedDecisions || 0;
      case "drafts": return pendingDrafts?.total || 0;
      default: return 0;
    }
  };

  const totalBadges = (pendingApprovals?.total || 0) + (pendingQuestions?.total || 0) + (unreviewedDecisions || 0) + (pendingDrafts?.total || 0);

  const sidebarContent = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="animate-pulse">⚡</span>
            <span>Mission Control</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Q's Command Center</p>
        </div>
        {/* Close button - mobile only */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden p-2 text-gray-400 hover:text-white"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Global Search */}
      <div className="mb-4">
        <GlobalSearch />
      </div>
      
      <nav className="space-y-0.5 flex-1">
        {navItems.map((item, index) => {
          if ('divider' in item) {
            return <div key={index} className="border-t border-gray-800 my-3" />;
          }
          
          const isActive = pathname === item.href;
          const badgeCount = item.badgeKey ? getBadgeCount(item.badgeKey) : 0;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {badgeCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  isActive ? "bg-white/20" : "bg-red-500 text-white"
                }`}>
                  {badgeCount}
                </span>
              )}
              {item.badge === "new" && !badgeCount && (
                <span className="text-[10px] px-1.5 py-0.5 bg-green-600 text-white rounded-full">
                  NEW
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Q Status Card */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className={`rounded-xl p-3 border transition-all duration-500 ${
          isOnline 
            ? "bg-gradient-to-br from-green-900/50 to-gray-900 border-green-800" 
            : "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`relative w-2.5 h-2.5 rounded-full ${
              isOnline ? "bg-green-500" : "bg-gray-500"
            }`}>
              {isOnline && (
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75"></div>
              )}
            </div>
            <span className="text-xs font-medium text-white">
              Q {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="text-[10px] text-gray-400 space-y-0.5">
            <p>Last seen: {timeSinceHeartbeat}</p>
            {currentTask && isOnline && (
              <p className="text-green-400 truncate">📌 {currentTask}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 -ml-2 text-gray-400 hover:text-white"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⚡</span>
          <span>Mission Control</span>
        </h1>
        <div className="flex items-center gap-2">
          {totalBadges > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {totalBadges}
            </span>
          )}
          <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-500"}`} />
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 md:w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        h-screen overflow-y-auto
      `}>
        {sidebarContent}
      </aside>
    </>
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
