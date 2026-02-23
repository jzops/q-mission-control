"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";

type DraftStatus = "pending" | "sent" | "edited" | "discarded";

export default function DraftsPage() {
  const [filter, setFilter] = useState<DraftStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [sending, setSending] = useState<string | null>(null);

  const drafts = useQuery(api.drafts.list, 
    filter === "all" ? {} : { status: filter as DraftStatus }
  );
  const markSent = useMutation(api.drafts.markSent);
  const discard = useMutation(api.drafts.discard);
  const update = useMutation(api.drafts.update);

  const handleSend = async (draftId: Id<"drafts">) => {
    setSending(draftId);
    try {
      // Call API to send via Gmail
      const response = await fetch("/api/drafts/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftId }),
      });
      
      if (response.ok) {
        await markSent({ id: draftId });
      } else {
        const error = await response.json();
        alert(`Failed to send: ${error.error || "Unknown error"}`);
      }
    } catch (err) {
      alert("Failed to send email");
    } finally {
      setSending(null);
    }
  };

  const handleEdit = (draft: { _id: Id<"drafts">; body: string }) => {
    setEditingId(draft._id);
    setEditBody(draft.body);
  };

  const handleSaveEdit = async (draftId: Id<"drafts">) => {
    await update({ id: draftId, body: editBody });
    setEditingId(null);
    setEditBody("");
  };

  const handleDiscard = async (draftId: Id<"drafts">) => {
    if (confirm("Discard this draft?")) {
      await discard({ id: draftId });
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent": return "bg-red-900/50 text-red-300 border-red-700";
      case "normal": return "bg-blue-900/50 text-blue-300 border-blue-700";
      case "low": return "bg-gray-700 text-gray-300 border-gray-600";
      default: return "bg-gray-700 text-gray-300 border-gray-600";
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "client": return "bg-green-900/50 text-green-300";
      case "internal": return "bg-purple-900/50 text-purple-300";
      case "personal": return "bg-yellow-900/50 text-yellow-300";
      default: return "bg-gray-700 text-gray-400";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-900/50 text-yellow-300 border border-yellow-700";
      case "sent": return "bg-green-900/50 text-green-300 border border-green-700";
      case "edited": return "bg-blue-900/50 text-blue-300 border border-blue-700";
      case "discarded": return "bg-gray-700 text-gray-400 border border-gray-600";
      default: return "bg-gray-700 text-gray-400";
    }
  };

  const pendingCount = drafts?.filter(d => d.status === "pending").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            📧 Email Drafts
            {pendingCount > 0 && (
              <span className="text-sm px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded-full">
                {pendingCount} pending
              </span>
            )}
          </h2>
          <p className="text-gray-400 mt-1">Review and send email drafts Q created</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        {(["all", "pending", "edited", "sent", "discarded"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
              filter === status
                ? "bg-gray-800 text-white border-b-2 border-blue-500"
                : "text-gray-400 hover:text-white hover:bg-gray-800/50"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Drafts List */}
      <div className="space-y-4">
        {drafts === undefined ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-400">No {filter === "all" ? "" : filter} drafts</p>
          </div>
        ) : (
          drafts.map((draft) => (
            <div
              key={draft._id}
              className={`bg-gray-900 rounded-xl border transition-all ${
                draft.status === "pending" 
                  ? "border-yellow-800/50 hover:border-yellow-700" 
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              {/* Draft Header */}
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(expandedId === draft._id ? null : draft._id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusBadge(draft.status)}`}>
                        {draft.status}
                      </span>
                      {draft.priority && (
                        <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(draft.priority)}`}>
                          {draft.priority}
                        </span>
                      )}
                      {draft.category && (
                        <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(draft.category)}`}>
                          {draft.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white truncate">{draft.subject}</h3>
                    <p className="text-sm text-gray-400 truncate">To: {draft.to}</p>
                    {expandedId !== draft._id && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {draft.body.slice(0, 150)}...
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(draft.createdAt)}
                    </span>
                    <span className={`transform transition-transform ${expandedId === draft._id ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === draft._id && (
                <div className="border-t border-gray-800 p-4">
                  {editingId === draft._id ? (
                    <div className="space-y-4">
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        className="w-full h-64 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-sm font-mono resize-none focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(draft._id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                          {draft.body}
                        </pre>
                      </div>

                      {/* Action Buttons */}
                      {draft.status === "pending" || draft.status === "edited" ? (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleSend(draft._id)}
                            disabled={sending === draft._id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                          >
                            {sending === draft._id ? (
                              <>
                                <span className="animate-spin">⏳</span>
                                Sending...
                              </>
                            ) : (
                              <>
                                ✓ Approve & Send
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleEdit(draft)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDiscard(draft._id)}
                            className="px-4 py-2 bg-gray-700 hover:bg-red-900/50 text-gray-300 hover:text-red-300 rounded-lg text-sm font-medium transition-colors"
                          >
                            🗑️ Discard
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {draft.status === "sent" && draft.sentAt && (
                            <span>✓ Sent {formatTimeAgo(draft.sentAt)}</span>
                          )}
                          {draft.status === "discarded" && (
                            <span>Discarded</span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
