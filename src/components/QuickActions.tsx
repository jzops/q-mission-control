"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface QuickActionsProps {
  onAction?: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const createTask = useMutation(api.tasks.create);
  const askQuestion = useMutation(api.questions.ask);

  const actions = [
    {
      id: "task",
      label: "Quick Task",
      icon: "➕",
      color: "from-blue-600 to-blue-700",
      hoverColor: "hover:from-blue-500 hover:to-blue-600",
      onClick: () => setShowTaskModal(true),
    },
    {
      id: "question",
      label: "Ask Q",
      icon: "💬",
      color: "from-purple-600 to-purple-700",
      hoverColor: "hover:from-purple-500 hover:to-purple-600",
      onClick: () => setShowQuestionModal(true),
    },
    {
      id: "inbox",
      label: "Check Inbox",
      icon: "📬",
      color: "from-green-600 to-green-700",
      hoverColor: "hover:from-green-500 hover:to-green-600",
      onClick: async () => {
        setLoading("inbox");
        try {
          await fetch("/api/inbox/check", { method: "POST" });
          onAction?.("inbox");
        } catch (e) {
          console.error(e);
        }
        setLoading(null);
      },
    },
    {
      id: "calendar",
      label: "Today's Calendar",
      icon: "📅",
      color: "from-orange-600 to-orange-700",
      hoverColor: "hover:from-orange-500 hover:to-orange-600",
      onClick: () => {
        window.location.href = "/calendar";
      },
    },
  ];

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    await createTask({
      title: taskTitle,
      assignee: "ai",
      priority: "medium",
    });
    setTaskTitle("");
    setShowTaskModal(false);
    onAction?.("task");
  };

  const handleAskQuestion = async () => {
    if (!questionText.trim()) return;
    await askQuestion({
      question: questionText,
      category: "decision",
      priority: "normal",
    });
    setQuestionText("");
    setShowQuestionModal(false);
    onAction?.("question");
  };

  return (
    <>
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
          ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={loading === action.id}
              className={`bg-gradient-to-br ${action.color} ${action.hoverColor} p-3 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center gap-1`}
            >
              <span className="text-xl">
                {loading === action.id ? "⏳" : action.icon}
              </span>
              <span className="text-xs">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              ➕ Quick Task
            </h3>
            <input
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!taskTitle.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ask Q Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              💬 Ask Q
            </h3>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="What do you want Q to help with?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 mb-4 h-24 resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowQuestionModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAskQuestion}
                disabled={!questionText.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Ask Q
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
