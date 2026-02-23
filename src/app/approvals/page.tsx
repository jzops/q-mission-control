"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const typeIcons: Record<string, string> = {
  email_send: "📧",
  social_post: "🐦",
  purchase: "💳",
  external_action: "🌐",
  code_deploy: "🚀",
  other: "📋",
};

const priorityColors: Record<string, string> = {
  urgent: "border-red-500 bg-red-900/20",
  normal: "border-yellow-500 bg-yellow-900/20",
  low: "border-gray-500 bg-gray-800",
};

export default function ApprovalsPage() {
  const pendingApprovals = useQuery(api.approvals.list, { status: "pending" });
  const recentApprovals = useQuery(api.approvals.list, { limit: 20 });
  const counts = useQuery(api.approvals.getPendingCount);
  
  const approve = useMutation(api.approvals.approve);
  const reject = useMutation(api.approvals.reject);
  
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const displayApprovals = filter === "pending" ? pendingApprovals : recentApprovals;

  const handleApprove = async (id: Id<"approvals">) => {
    await approve({ id, feedback: feedback || undefined });
    setFeedback("");
    setExpandedId(null);
  };

  const handleReject = async (id: Id<"approvals">) => {
    await reject({ id, feedback: feedback || undefined });
    setFeedback("");
    setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Approvals</h2>
          <p className="text-gray-400">Actions waiting for your OK</p>
        </div>
        {counts && counts.total > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg">
            <span className="text-red-400 font-bold">{counts.total}</span>
            <span className="text-red-300">pending</span>
            {counts.urgent > 0 && (
              <span className="text-red-400 text-sm">({counts.urgent} urgent)</span>
            )}
          </div>
        )}
      </div>

      {/* Type breakdown */}
      {counts && counts.total > 0 && (
        <div className="flex gap-3">
          {Object.entries(counts.byType).map(([type, count]) => count > 0 && (
            <div key={type} className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm flex items-center gap-2">
              <span>{typeIcons[type === "email" ? "email_send" : type === "social" ? "social_post" : "other"]}</span>
              <span className="capitalize">{type}</span>
              <span className="text-gray-400">({count})</span>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("pending")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "pending" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Pending ({pendingApprovals?.length || 0})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Recent History
        </button>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {displayApprovals?.map((approval) => {
          const isExpanded = expandedId === approval._id;
          const isPending = approval.status === "pending";
          
          return (
            <div
              key={approval._id}
              className={`rounded-xl border transition-all ${
                isPending 
                  ? priorityColors[approval.priority]
                  : approval.status === "approved"
                  ? "border-green-700 bg-green-900/10"
                  : "border-red-700 bg-red-900/10"
              }`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : approval._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{typeIcons[approval.type]}</span>
                    <div>
                      <h3 className="font-semibold">{approval.title}</h3>
                      <p className="text-sm text-gray-400 mt-1">{approval.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          approval.priority === "urgent" ? "bg-red-600" :
                          approval.priority === "normal" ? "bg-yellow-600" : "bg-gray-600"
                        }`}>
                          {approval.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(approval.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPending && (
                      <span className={`px-3 py-1 rounded text-sm ${
                        approval.status === "approved" 
                          ? "bg-green-600 text-white" 
                          : "bg-red-600 text-white"
                      }`}>
                        {approval.status}
                      </span>
                    )}
                    <span className="text-gray-500">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-700 p-4 space-y-4">
                  {approval.content && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Content:</p>
                      <div className="p-3 bg-gray-800 rounded-lg text-sm whitespace-pre-wrap max-h-60 overflow-auto">
                        {approval.content}
                      </div>
                    </div>
                  )}

                  {isPending && (
                    <div className="space-y-3">
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Optional feedback..."
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm resize-none h-20"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(approval._id)}
                          className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleReject(approval._id)}
                          className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {!isPending && approval.feedback && (
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-400">Feedback:</p>
                      <p className="text-sm mt-1">{approval.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {(!displayApprovals || displayApprovals.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">✋</p>
            <p className="text-lg">No pending approvals</p>
            <p className="text-sm mt-1">Q will queue things here before taking action</p>
          </div>
        )}
      </div>
    </div>
  );
}
