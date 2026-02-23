"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const categoryIcons: Record<string, string> = {
  email: "📧",
  scheduling: "📅",
  prioritization: "📊",
  communication: "💬",
  technical: "⚙️",
  other: "📋",
};

const impactColors: Record<string, string> = {
  high: "text-red-400 bg-red-900/30",
  medium: "text-yellow-400 bg-yellow-900/30",
  low: "text-gray-400 bg-gray-800",
};

export default function DecisionsPage() {
  const unreviewedDecisions = useQuery(api.decisions.list, { reviewed: false });
  const allDecisions = useQuery(api.decisions.list, { limit: 50 });
  const stats = useQuery(api.decisions.getFeedbackStats);
  
  const provideFeedback = useMutation(api.decisions.provideFeedback);
  const markReviewed = useMutation(api.decisions.markReviewed);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState<"unreviewed" | "all">("unreviewed");

  const displayDecisions = filter === "unreviewed" ? unreviewedDecisions : allDecisions;

  const handleFeedback = async (id: Id<"decisions">, feedback: "good" | "bad" | "neutral") => {
    await provideFeedback({ id, feedback, note: note || undefined });
    setNote("");
    setExpandedId(null);
  };

  const handleSkip = async (id: Id<"decisions">) => {
    await markReviewed({ id });
    setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Decisions</h2>
          <p className="text-gray-400">Autonomous choices Q made</p>
        </div>
        {stats && stats.pending > 0 && (
          <div className="px-4 py-2 bg-purple-900/30 border border-purple-700 rounded-lg">
            <span className="text-purple-300">{stats.pending} to review</span>
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 text-center">
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm text-gray-400">Total Decisions</p>
          </div>
          <div className="bg-green-900/20 rounded-xl p-4 border border-green-800 text-center">
            <p className="text-3xl font-bold text-green-400">{stats.good}</p>
            <p className="text-sm text-gray-400">Good Calls 👍</p>
          </div>
          <div className="bg-red-900/20 rounded-xl p-4 border border-red-800 text-center">
            <p className="text-3xl font-bold text-red-400">{stats.bad}</p>
            <p className="text-sm text-gray-400">Needs Work 👎</p>
          </div>
          <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-800 text-center">
            <p className="text-3xl font-bold text-blue-400">{stats.successRate}%</p>
            <p className="text-sm text-gray-400">Success Rate</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("unreviewed")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "unreviewed" 
              ? "bg-purple-600 text-white" 
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Needs Review ({unreviewedDecisions?.length || 0})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all" 
              ? "bg-purple-600 text-white" 
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          All Decisions
        </button>
      </div>

      {/* Decisions List */}
      <div className="space-y-4">
        {displayDecisions?.map((decision) => {
          const isExpanded = expandedId === decision._id;
          
          return (
            <div
              key={decision._id}
              className={`rounded-xl border transition-all ${
                decision.reviewed
                  ? decision.feedback === "good"
                    ? "border-green-800 bg-green-900/10"
                    : decision.feedback === "bad"
                    ? "border-red-800 bg-red-900/10"
                    : "border-gray-700 bg-gray-900"
                  : "border-purple-700 bg-purple-900/10"
              }`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : decision._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{categoryIcons[decision.category]}</span>
                    <div>
                      <h3 className="font-semibold">{decision.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{decision.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${impactColors[decision.impact]}`}>
                          {decision.impact} impact
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(decision.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {decision.reviewed && (
                      <span className="text-xl">
                        {decision.feedback === "good" ? "👍" : 
                         decision.feedback === "bad" ? "👎" : "➖"}
                      </span>
                    )}
                    <span className="text-gray-500">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-700 p-4 space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Reasoning:</p>
                    <p className="text-sm p-3 bg-gray-800 rounded-lg">{decision.reasoning}</p>
                  </div>

                  {decision.alternatives && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Alternatives Considered:</p>
                      <ul className="text-sm p-3 bg-gray-800 rounded-lg list-disc list-inside">
                        {JSON.parse(decision.alternatives).map((alt: string, i: number) => (
                          <li key={i} className="text-gray-300">{alt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!decision.reviewed ? (
                    <div className="space-y-3">
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note (helpful if giving negative feedback)..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm resize-none h-16"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback(decision._id, "good")}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                        >
                          👍 Good Call
                        </button>
                        <button
                          onClick={() => handleFeedback(decision._id, "neutral")}
                          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
                        >
                          ➖ OK
                        </button>
                        <button
                          onClick={() => handleFeedback(decision._id, "bad")}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                        >
                          👎 Ask Next Time
                        </button>
                      </div>
                      <button
                        onClick={() => handleSkip(decision._id)}
                        className="w-full px-4 py-2 text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        Skip (mark as reviewed)
                      </button>
                    </div>
                  ) : decision.feedbackNote && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Your note:</p>
                      <p className="text-sm mt-1">{decision.feedbackNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {(!displayDecisions || displayDecisions.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">🎯</p>
            <p className="text-lg">No decisions to review</p>
            <p className="text-sm mt-1">Q will log autonomous decisions here for your feedback</p>
          </div>
        )}
      </div>
    </div>
  );
}
