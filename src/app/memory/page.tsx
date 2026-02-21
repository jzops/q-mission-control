"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function MemoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemory, setNewMemory] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });

  const memories = searchQuery
    ? useQuery(api.memories.search, { query: searchQuery })
    : useQuery(api.memories.list, { limit: 100 });
  const categories = useQuery(api.memories.getCategories);
  const createMemory = useMutation(api.memories.create);
  const deleteMemory = useMutation(api.memories.remove);

  const handleCreate = async () => {
    if (!newMemory.title.trim() || !newMemory.content.trim()) return;
    await createMemory({
      title: newMemory.title,
      content: newMemory.content,
      category: newMemory.category || undefined,
      tags: newMemory.tags ? newMemory.tags.split(",").map((t) => t.trim()) : undefined,
    });
    setNewMemory({ title: "", content: "", category: "", tags: "" });
    setShowAddForm(false);
  };

  const filteredMemories = selectedCategory
    ? memories?.filter((m) => m.category === selectedCategory)
    : memories;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Memory</h2>
          <p className="text-gray-400">Your digital memory bank</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
        >
          + Add Memory
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full px-4 py-3 pl-10 bg-gray-900 border border-gray-800 rounded-xl focus:outline-none focus:border-purple-500"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              !selectedCategory
                ? "border-purple-500 bg-purple-900/50"
                : "border-gray-700 hover:border-gray-600"
            }`}
          >
            All
          </button>
          {categories?.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                selectedCategory === cat
                  ? "border-purple-500 bg-purple-900/50"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Add Memory Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-lg border border-gray-800">
            <h3 className="text-xl font-bold mb-4">🧠 New Memory</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newMemory.title}
                  onChange={(e) => setNewMemory({ ...newMemory, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Memory title..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content</label>
                <textarea
                  value={newMemory.content}
                  onChange={(e) => setNewMemory({ ...newMemory, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 h-32 resize-none"
                  placeholder="What do you want to remember?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={newMemory.category}
                    onChange={(e) => setNewMemory({ ...newMemory, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="e.g., work, personal"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newMemory.tags}
                    onChange={(e) => setNewMemory({ ...newMemory, tags: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="tag1, tag2"
                  />
                </div>
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
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  Save Memory
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMemories?.map((memory) => (
          <div
            key={memory._id}
            className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold">{memory.title}</h4>
              <button
                onClick={() => deleteMemory({ id: memory._id })}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4 line-clamp-4">{memory.content}</p>
            <div className="flex items-center justify-between">
              {memory.category && (
                <span className="text-xs px-2 py-1 bg-purple-900/50 text-purple-300 rounded">
                  {memory.category}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(memory.createdAt).toLocaleDateString()}
              </span>
            </div>
            {memory.tags && memory.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {memory.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 bg-gray-800 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {(!filteredMemories || filteredMemories.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">🧠</p>
          <p>{searchQuery ? "No memories found" : "No memories yet"}</p>
        </div>
      )}
    </div>
  );
}
