"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const avatarOptions = ["🤖", "🧠", "💻", "🎨", "📝", "🔧", "📊", "🎯", "⚡", "🚀"];

export default function TeamPage() {
  const agents = useQuery(api.agents.list);
  const createAgent = useMutation(api.agents.create);
  const updateAgent = useMutation(api.agents.update);
  const deleteAgent = useMutation(api.agents.remove);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: "",
    role: "",
    responsibilities: "",
    avatar: "🤖",
  });

  const handleCreate = async () => {
    if (!newAgent.name.trim() || !newAgent.role.trim()) return;
    await createAgent({
      name: newAgent.name,
      role: newAgent.role,
      responsibilities: newAgent.responsibilities.split(",").map((r) => r.trim()).filter(Boolean),
      avatar: newAgent.avatar,
    });
    setNewAgent({ name: "", role: "", responsibilities: "", avatar: "🤖" });
    setShowAddForm(false);
  };

  // Group agents by role
  const roleGroups = agents?.reduce((acc, agent) => {
    if (!acc[agent.role]) acc[agent.role] = [];
    acc[agent.role].push(agent);
    return acc;
  }, {} as Record<string, typeof agents>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Team</h2>
          <p className="text-gray-400">Your digital organization</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition-colors"
        >
          + Add Agent
        </button>
      </div>

      {/* Add Agent Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-xl font-bold mb-4">👥 New Team Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {avatarOptions.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setNewAgent({ ...newAgent, avatar })}
                      className={`text-2xl p-2 rounded-lg border transition-colors ${
                        newAgent.avatar === avatar
                          ? "border-cyan-500 bg-cyan-900/50"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  placeholder="Agent name..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <input
                  type="text"
                  value={newAgent.role}
                  onChange={(e) => setNewAgent({ ...newAgent, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
                  placeholder="e.g., Developer, Writer, Designer"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Responsibilities (comma-separated)</label>
                <textarea
                  value={newAgent.responsibilities}
                  onChange={(e) => setNewAgent({ ...newAgent, responsibilities: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500 h-20 resize-none"
                  placeholder="Build features, Review code, Write docs"
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
                  className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition-colors"
                >
                  Add Agent
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Org Chart by Role */}
      <div className="space-y-8">
        {/* Lead Agent (Q) */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-b from-purple-900/50 to-gray-900 rounded-xl p-6 border border-purple-800">
            <div className="text-5xl mb-2">⚡</div>
            <h3 className="text-xl font-bold">Q</h3>
            <p className="text-sm text-gray-400">Primary AI Assistant</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Online</span>
            </div>
          </div>
        </div>

        {/* Role Groups */}
        {roleGroups && Object.keys(roleGroups).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(roleGroups).map(([role, roleAgents]) => (
              <div key={role} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h4 className="font-semibold mb-4 text-lg">{role}</h4>
                <div className="space-y-3">
                  {roleAgents?.map((agent) => (
                    <div
                      key={agent._id}
                      className="bg-gray-800 rounded-lg p-4 group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{agent.avatar || "🤖"}</span>
                          <div>
                            <h5 className="font-medium">{agent.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`w-2 h-2 rounded-full ${
                                agent.status === "working" ? "bg-green-500 animate-pulse" :
                                agent.status === "idle" ? "bg-yellow-500" : "bg-gray-500"
                              }`}></span>
                              <span className="text-xs text-gray-400 capitalize">{agent.status}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteAgent({ id: agent._id })}
                          className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all"
                        >
                          ×
                        </button>
                      </div>
                      {agent.currentTask && (
                        <p className="text-sm text-gray-400 mt-2 pl-12">
                          📌 {agent.currentTask}
                        </p>
                      )}
                      {agent.responsibilities.length > 0 && (
                        <div className="mt-3 pl-12 flex flex-wrap gap-1">
                          {agent.responsibilities.map((r, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                              {r}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {(!agents || agents.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">👥</p>
            <p>No sub-agents configured yet</p>
            <p className="text-sm mt-2">Add agents for specific roles like Developer, Writer, or Designer</p>
          </div>
        )}
      </div>
    </div>
  );
}
