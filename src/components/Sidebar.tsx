"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { GlobalSearch } from "./GlobalSearch";

// Navigation grouped by category
const navGroups = [
  {
    label: "Inbox",
    items: [
      { href: "/", label: "Dashboard", icon: "🏠" },
      { href: "/drafts", label: "Drafts", icon: "📧", badgeKey: "drafts" },
      { href: "/approvals", label: "Approvals", icon: "✋", badgeKey: "approvals" },
      { href: "/questions", label: "Questions", icon: "❓", badgeKey: "questions" },
    ],
  },
  {
    label: "Work",
    items: [
      { href: "/tasks", label: "Tasks", icon: "✅" },
      { href: "/decisions", label: "Decisions", icon: "🎯", badgeKey: "decisions" },
      { href: "/sessions", label: "Sessions", icon: "📜" },
      { href: "/crons", label: "Cron Jobs", icon: "⏰" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { href: "/memory", label: "Memory", icon: "🧠" },
      { href: "/lessons", label: "Lessons", icon: "📚" },
      { href: "/skills", label: "Skills", icon: "📋" },
    ],
  },
  {
    label: "Organization",
    items: [
      { href: "/people", label: "People", icon: "👤" },
      { href: "/team", label: "Team", icon: "👥" },
      { href: "/office", label: "Office", icon: "🏢" },
      { href: "/calendar", label: "Calendar", icon: "📅" },
      { href: "/content", label: "Content", icon: "📝" },
    ],
  },
];

// Mobile bottom tab bar - most used items
const bottomTabs = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/drafts", label: "Drafts", icon: "📧", badgeKey: "drafts" },
  { href: "/tasks", label: "Tasks", icon: "✅" },
  { href: "/approvals", label: "Inbox", icon: "✋", badgeKey: "approvals" },
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

  const isOnline = lastHeartbeat && Date.now() - lastHeartbeat < 5 * 60 * 1000;
  const timeSinceHeartbeat = lastHeartbeat ? formatTimeAgo(Date.now() - lastHeartbeat) : "Never";

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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

  const totalBadges =
    (pendingApprovals?.total || 0) +
    (pendingQuestions?.total || 0) +
    (unreviewedDecisions || 0) +
    (pendingDrafts?.total || 0);

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 text-gray-400 hover:text-white active:scale-95 transition-transform"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <span>Mission Control</span>
          </h1>

          <div className="flex items-center gap-3">
            {totalBadges > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {totalBadges}
              </span>
            )}
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 pb-safe">
        <div className="flex items-center justify-around px-1 h-16">
          {bottomTabs.map((tab) => {
            const isActive = pathname === tab.href;
            const badgeCount = tab.badgeKey ? getBadgeCount(tab.badgeKey) : 0;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all min-w-[56px] active:scale-95 ${
                  isActive ? "text-blue-400" : "text-gray-500"
                }`}
              >
                <div className="relative">
                  <span className={`text-2xl ${isActive ? "" : "grayscale opacity-70"}`}>{tab.icon}</span>
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 font-medium ${isActive ? "text-blue-400" : "text-gray-500"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Slide-out Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between px-4 h-14 border-b border-gray-800">
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <span>⚡</span> Mission Control
              </h1>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-white active:scale-95 transition-transform rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-800">
            <GlobalSearch />
          </div>

          {/* Nav Groups */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    const badgeCount = item.badgeKey ? getBadgeCount(item.badgeKey) : 0;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all active:scale-[0.98] ${
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "text-gray-300 hover:bg-gray-800 active:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {badgeCount > 0 && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            isActive ? "bg-white/20" : "bg-red-500 text-white"
                          }`}>
                            {badgeCount}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Q Status */}
          <div className="p-4 border-t border-gray-800 pb-safe">
            <div className={`rounded-xl p-4 border ${
              isOnline
                ? "bg-gradient-to-br from-green-900/40 to-gray-900 border-green-800"
                : "bg-gray-800/50 border-gray-700"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`relative w-3 h-3 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-500"}`}>
                  {isOnline && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />}
                </div>
                <span className="font-semibold text-white">Q {isOnline ? "Online" : "Offline"}</span>
              </div>
              <p className="text-xs text-gray-400">Last seen: {timeSinceHeartbeat}</p>
              {currentTask && isOnline && (
                <p className="text-xs text-green-400 mt-1 truncate">📌 {currentTask}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-gray-900 border-r border-gray-800 flex-col h-screen sticky top-0">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="animate-pulse">⚡</span>
            <span>Mission Control</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Q&apos;s Command Center</p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <GlobalSearch />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 px-2">
                {group.label}
              </h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const badgeCount = item.badgeKey ? getBadgeCount(item.badgeKey) : 0;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/20"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {badgeCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          isActive ? "bg-white/20" : "bg-red-500 text-white"
                        }`}>
                          {badgeCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Q Status */}
        <div className="p-4 border-t border-gray-800">
          <div className={`rounded-xl p-3 border transition-all ${
            isOnline
              ? "bg-gradient-to-br from-green-900/50 to-gray-900 border-green-800"
              : "bg-gray-800/50 border-gray-700"
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`relative w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-500"}`}>
                {isOnline && <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />}
              </div>
              <span className="text-xs font-medium text-white">Q {isOnline ? "Online" : "Offline"}</span>
            </div>
            <div className="text-[10px] text-gray-400 space-y-0.5">
              <p>Last seen: {timeSinceHeartbeat}</p>
              {currentTask && isOnline && <p className="text-green-400 truncate">📌 {currentTask}</p>}
            </div>
          </div>
        </div>
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
