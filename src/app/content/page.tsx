"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type Stage = "idea" | "script" | "thumbnail" | "filming" | "editing" | "published";

const stages: { key: Stage; label: string; icon: string; color: string }[] = [
  { key: "idea", label: "Ideas", icon: "💡", color: "border-yellow-600" },
  { key: "script", label: "Script", icon: "📝", color: "border-blue-600" },
  { key: "thumbnail", label: "Thumbnail", icon: "🎨", color: "border-purple-600" },
  { key: "filming", label: "Filming", icon: "🎬", color: "border-orange-600" },
  { key: "editing", label: "Editing", icon: "✂️", color: "border-pink-600" },
  { key: "published", label: "Published", icon: "🚀", color: "border-green-600" },
];

export default function ContentPage() {
  const content = useQuery(api.content.list);
  const createContent = useMutation(api.content.create);
  const updateStage = useMutation(api.content.updateStage);
  const deleteContent = useMutation(api.content.remove);

  const [newIdea, setNewIdea] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreate = async () => {
    if (!newIdea.trim()) return;
    await createContent({ title: newIdea });
    setNewIdea("");
    setShowAddForm(false);
  };

  const handleDragStart = (e: React.DragEvent, contentId: string) => {
    e.dataTransfer.setData("contentId", contentId);
  };

  const handleDrop = async (e: React.DragEvent, stage: Stage) => {
    e.preventDefault();
    const contentId = e.dataTransfer.getData("contentId") as Id<"content">;
    await updateStage({ id: contentId, stage });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Content Pipeline</h2>
          <p className="text-gray-400">Manage your content creation workflow</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors"
        >
          + Add Idea
        </button>
      </div>

      {/* Add Idea Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-xl font-bold mb-4">💡 New Content Idea</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newIdea}
                  onChange={(e) => setNewIdea(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-yellow-500"
                  placeholder="Content idea..."
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-medium transition-colors"
                >
                  Add Idea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.map((stage) => (
            <div
              key={stage.key}
              className={`w-64 bg-gray-900 rounded-xl p-4 border-t-4 ${stage.color} min-h-[400px] flex-shrink-0`}
              onDrop={(e) => handleDrop(e, stage.key)}
              onDragOver={handleDragOver}
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span>{stage.icon}</span>
                {stage.label}
                <span className="text-sm text-gray-400 ml-auto">
                  {content?.filter((c) => c.stage === stage.key).length ?? 0}
                </span>
              </h3>
              <div className="space-y-3">
                {content
                  ?.filter((c) => c.stage === stage.key)
                  .map((item) => (
                    <div
                      key={item._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item._id)}
                      className="bg-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-gray-750 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm">{item.title}</span>
                        <button
                          onClick={() => deleteContent({ id: item._id })}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all"
                        >
                          ×
                        </button>
                      </div>
                      {item.description && (
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
