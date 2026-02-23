"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const categoryIcons: Record<string, string> = {
  communication: "💬",
  technical: "⚙️",
  prioritization: "📊",
  style: "🎨",
  process: "📋",
  other: "📝",
};

const sourceColors: Record<string, string> = {
  feedback: "bg-blue-900/30 border-blue-700",
  correction: "bg-red-900/30 border-red-700",
  observation: "bg-green-900/30 border-green-700",
  explicit: "bg-purple-900/30 border-purple-700",
};

const sourceLabels: Record<string, string> = {
  feedback: "From your feedback",
  correction: "From a correction",
  observation: "Q observed",
  explicit: "You told Q",
};

export default function LessonsPage() {
  const lessons = useQuery(api.lessons.list, { limit: 100 });
  const unappliedLessons = useQuery(api.lessons.list, { applied: false });
  const stats = useQuery(api.lessons.getStats);
  
  const markApplied = useMutation(api.lessons.markApplied);
  const removeLesson = useMutation(api.lessons.remove);
  
  const [filter, setFilter] = useState<string | null>(null);
  const [showApplied, setShowApplied] = useState(true);

  const displayLessons = lessons?.filter(l => {
    if (filter && l.category !== filter) return false;
    if (!showApplied && l.applied) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Lessons Learned</h2>
          <p className="text-gray-400">How Q is learning from you</p>
        </div>
        {stats && stats.pending > 0 && (
          <div className="px-4 py-2 bg-yellow-900/30 border border-yellow-700 rounded-lg">
            <span className="text-yellow-300">{stats.pending} to apply</span>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-400">Total Lessons</p>
          </div>
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-800 text-center">
            <p className="text-3xl font-bold text-green-400">{stats.applied}</p>
            <p className="text-sm text-gray-400">Applied ✓</p>
          </div>
          <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-800 text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-sm text-gray-400">Pending</p>
          </div>
          <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {stats.bySource?.feedback || 0}
            </p>
            <p className="text-sm text-gray-400">From Feedback</p>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
            filter === null ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          All
        </button>
        {Object.entries(categoryIcons).map(([cat, icon]) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${
              filter === cat ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <span>{icon}</span>
            <span className="capitalize">{cat}</span>
            <span className="text-xs opacity-70">({stats?.byCategory?.[cat] || 0})</span>
          </button>
        ))}
        <div className="flex-1"></div>
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showApplied}
            onChange={(e) => setShowApplied(e.target.checked)}
            className="rounded bg-gray-800 border-gray-600"
          />
          Show applied
        </label>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        {displayLessons?.map((lesson) => (
          <div
            key={lesson._id}
            className={`rounded-xl border p-4 transition-all ${
              lesson.applied 
                ? "border-gray-700 bg-gray-900 opacity-75" 
                : sourceColors[lesson.source]
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{categoryIcons[lesson.category]}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{lesson.title}</h3>
                    {lesson.applied && (
                      <span className="text-xs px-2 py-0.5 bg-green-900/50 text-green-300 rounded">
                        ✓ Applied
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{lesson.description}</p>
                  <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border-l-2 border-blue-500">
                    <p className="text-sm font-medium text-blue-300">💡 Lesson:</p>
                    <p className="text-sm mt-1">{lesson.lesson}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                      {sourceLabels[lesson.source]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(lesson.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!lesson.applied && (
                  <button
                    onClick={() => markApplied({ id: lesson._id })}
                    className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    Mark Applied
                  </button>
                )}
                <button
                  onClick={() => removeLesson({ id: lesson._id })}
                  className="px-2 py-1 text-gray-500 hover:text-red-400 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}

        {(!displayLessons || displayLessons.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">📚</p>
            <p className="text-lg">No lessons yet</p>
            <p className="text-sm mt-1">Q will learn from your feedback and corrections</p>
          </div>
        )}
      </div>
    </div>
  );
}
