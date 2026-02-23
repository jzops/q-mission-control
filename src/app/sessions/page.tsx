"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";

const typeIcons: Record<string, string> = {
  email: "📧",
  coding: "💻",
  research: "🔍",
  automation: "⚙️",
  communication: "💬",
  memory: "🧠",
  other: "📝",
};

const typeColors: Record<string, string> = {
  email: "bg-blue-900/50 border-blue-700",
  coding: "bg-purple-900/50 border-purple-700",
  research: "bg-green-900/50 border-green-700",
  automation: "bg-orange-900/50 border-orange-700",
  communication: "bg-cyan-900/50 border-cyan-700",
  memory: "bg-pink-900/50 border-pink-700",
  other: "bg-gray-800 border-gray-700",
};

export default function SessionsPage() {
  const sessions = useQuery(api.sessions.list, { limit: 14 });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const entries = useQuery(api.sessions.getEntries, { 
    date: selectedDate || new Date().toISOString().split("T")[0],
    limit: 100,
  });
  const stats = useQuery(api.sessions.getStats, { days: 7 });

  const today = new Date().toISOString().split("T")[0];
  const displayDate = selectedDate || today;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Session Log</h2>
        <p className="text-gray-400">What Q did while you were away</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Last 7 Days</p>
          <p className="text-2xl font-bold">{stats?.sessionCount || 0} sessions</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Total Actions</p>
          <p className="text-2xl font-bold">{stats?.totalActions || 0}</p>
        </div>
        <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Avg/Day</p>
          <p className="text-2xl font-bold">{stats?.avgActionsPerDay || 0}</p>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sessions?.map((session) => {
          const isSelected = session.date === displayDate;
          const date = new Date(session.date + "T12:00:00");
          const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = date.getDate();
          
          return (
            <button
              key={session._id}
              onClick={() => setSelectedDate(session.date)}
              className={`flex-shrink-0 p-3 rounded-xl border text-center min-w-[70px] transition-all ${
                isSelected
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-900 border-gray-800 hover:border-gray-600"
              }`}
            >
              <p className="text-xs opacity-70">{dayName}</p>
              <p className="text-lg font-bold">{dayNum}</p>
              <p className="text-xs">{session.totalActions || 0} actions</p>
            </button>
          );
        })}
        {(!sessions || sessions.length === 0) && (
          <p className="text-gray-500 py-4">No sessions recorded yet</p>
        )}
      </div>

      {/* Entries Timeline */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {displayDate === today ? "Today" : new Date(displayDate + "T12:00:00").toLocaleDateString("en-US", { 
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          <span className="text-sm text-gray-400">
            {entries?.length || 0} entries
          </span>
        </div>

        {entries && entries.length > 0 ? (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div
                key={entry._id}
                className={`p-4 rounded-lg border ${typeColors[entry.type]} animate-fadeIn`}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{typeIcons[entry.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="font-medium">{entry.action}</h4>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString([], { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </span>
                    </div>
                    {entry.reasoning && (
                      <p className="text-sm text-gray-400 mt-1">
                        <span className="text-gray-500">Why:</span> {entry.reasoning}
                      </p>
                    )}
                    {entry.outcome && (
                      <p className="text-sm text-green-400 mt-1">
                        <span className="text-gray-500">Outcome:</span> {entry.outcome}
                      </p>
                    )}
                    {entry.relatedTo && (
                      <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-gray-700 rounded">
                        {entry.relatedTo}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">📜</p>
            <p>No entries for this day</p>
            <p className="text-sm mt-1">Q will log actions here as they happen</p>
          </div>
        )}
      </div>
    </div>
  );
}
