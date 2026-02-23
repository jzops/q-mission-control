"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const categoryIcons: Record<string, string> = {
  clarification: "🤔",
  permission: "🔐",
  preference: "💭",
  decision: "⚖️",
  feedback: "📝",
  other: "❓",
};

const priorityStyles: Record<string, string> = {
  urgent: "border-l-4 border-l-red-500 bg-red-900/20",
  normal: "border-l-4 border-l-yellow-500 bg-yellow-900/10",
  low: "border-l-4 border-l-gray-500 bg-gray-800/50",
};

export default function QuestionsPage() {
  const pendingQuestions = useQuery(api.questions.list, { status: "pending" });
  const answeredQuestions = useQuery(api.questions.list, { status: "answered", limit: 20 });
  const counts = useQuery(api.questions.getPendingCount);
  
  const answerQuestion = useMutation(api.questions.answer);
  const dismissQuestion = useMutation(api.questions.dismiss);
  
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [filter, setFilter] = useState<"pending" | "answered">("pending");

  const handleAnswer = async (id: Id<"questions">) => {
    if (!answer.trim()) return;
    await answerQuestion({ id, answer });
    setAnswer("");
    setActiveQuestion(null);
  };

  const handleDismiss = async (id: Id<"questions">) => {
    await dismissQuestion({ id });
    setActiveQuestion(null);
  };

  const displayQuestions = filter === "pending" ? pendingQuestions : answeredQuestions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Questions</h2>
          <p className="text-gray-400">Things Q wants to ask you</p>
        </div>
        {counts && counts.total > 0 && (
          <div className="flex items-center gap-3">
            {counts.urgent > 0 && (
              <span className="px-3 py-1.5 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                🔴 {counts.urgent} urgent
              </span>
            )}
            <span className="px-3 py-1.5 bg-gray-800 rounded-lg text-sm">
              {counts.total} pending
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {counts && counts.total > 0 && (
        <div className="flex gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{counts.urgent}</p>
            <p className="text-xs text-gray-400">Urgent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-400">{counts.normal}</p>
            <p className="text-xs text-gray-400">Normal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-400">{counts.low}</p>
            <p className="text-xs text-gray-400">Low</p>
          </div>
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
          Pending ({pendingQuestions?.length || 0})
        </button>
        <button
          onClick={() => setFilter("answered")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "answered" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Answered
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {displayQuestions?.map((question) => {
          const isActive = activeQuestion === question._id;
          const isPending = question.status === "pending";
          
          return (
            <div
              key={question._id}
              className={`rounded-xl border border-gray-800 overflow-hidden ${
                isPending ? priorityStyles[question.priority] : "bg-gray-900"
              }`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setActiveQuestion(isActive ? null : question._id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{categoryIcons[question.category]}</span>
                  <div className="flex-1">
                    <p className="font-medium">{question.question}</p>
                    {question.context && (
                      <p className="text-sm text-gray-400 mt-2 p-2 bg-gray-800/50 rounded">
                        {question.context}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs px-2 py-0.5 bg-gray-700 rounded capitalize">
                        {question.category}
                      </span>
                      {question.relatedTo && (
                        <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                          {question.relatedTo}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(question.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {!isPending && (
                    <span className={`px-2 py-1 rounded text-xs ${
                      question.status === "answered" 
                        ? "bg-green-900/50 text-green-300" 
                        : "bg-gray-700 text-gray-300"
                    }`}>
                      {question.status}
                    </span>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="border-t border-gray-700 p-4 bg-gray-800/30">
                  {isPending ? (
                    <div className="space-y-3">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type your answer..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg resize-none h-24 focus:border-blue-500 focus:outline-none"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAnswer(question._id)}
                          disabled={!answer.trim()}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                        >
                          Answer
                        </button>
                        <button
                          onClick={() => handleDismiss(question._id)}
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Answer:</p>
                      <p className="text-sm">{question.answer}</p>
                      {question.answeredAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          Answered {new Date(question.answeredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {(!displayQuestions || displayQuestions.length === 0) && (
          <div className="text-center py-16 text-gray-500">
            <p className="text-5xl mb-3">❓</p>
            <p className="text-lg">No {filter} questions</p>
            <p className="text-sm mt-1">
              {filter === "pending" 
                ? "Q will ask questions here instead of interrupting you"
                : "Your answered questions will appear here"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
