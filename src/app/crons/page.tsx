"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function CronsPage() {
  const cronJobs = useQuery(api.cronJobs.list);
  const createCron = useMutation(api.cronJobs.create);
  const updateCron = useMutation(api.cronJobs.update);
  const deleteCron = useMutation(api.cronJobs.remove);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newCron, setNewCron] = useState({
    name: "",
    schedule: "",
    description: "",
  });

  const handleCreate = async () => {
    if (!newCron.name.trim() || !newCron.schedule.trim()) return;
    await createCron({
      name: newCron.name,
      schedule: newCron.schedule,
      description: newCron.description || undefined,
    });
    setNewCron({ name: "", schedule: "", description: "" });
    setShowAddForm(false);
  };

  const activeCrons = cronJobs?.filter(c => c.status === "active") || [];
  const pausedCrons = cronJobs?.filter(c => c.status === "paused") || [];
  const failedCrons = cronJobs?.filter(c => c.status === "failed") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Cron Jobs</h2>
          <p className="text-gray-400">Scheduled tasks and automations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 rounded-lg font-medium transition-all shadow-lg shadow-orange-500/20"
        >
          + Add Cron Job
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Active" count={activeCrons.length} color="green" icon="▶️" />
        <StatCard title="Paused" count={pausedCrons.length} color="yellow" icon="⏸️" />
        <StatCard title="Failed" count={failedCrons.length} color="red" icon="❌" />
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800 animate-fadeIn">
            <h3 className="text-xl font-bold mb-4">⏰ New Cron Job</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={newCron.name}
                  onChange={(e) => setNewCron({ ...newCron, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                  placeholder="Email draft check..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Schedule (cron expression)</label>
                <input
                  type="text"
                  value={newCron.schedule}
                  onChange={(e) => setNewCron({ ...newCron, schedule: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 font-mono transition-colors"
                  placeholder="*/30 * * * *"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., */30 * * * * = every 30 minutes</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={newCron.description}
                  onChange={(e) => setNewCron({ ...newCron, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500 h-20 resize-none transition-colors"
                  placeholder="What does this cron job do?"
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 rounded-lg font-medium transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cron Jobs List */}
      <div className="space-y-4">
        {cronJobs?.map((cron) => (
          <div
            key={cron._id}
            className="bg-gray-900 rounded-xl p-5 border border-gray-800 hover:border-gray-700 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`relative w-4 h-4 rounded-full ${
                  cron.status === "active" ? "bg-green-500" :
                  cron.status === "paused" ? "bg-yellow-500" : "bg-red-500"
                }`}>
                  {cron.status === "active" && (
                    <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-50"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{cron.name}</h3>
                  <code className="text-sm text-orange-400 font-mono">{cron.schedule}</code>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {cron.status === "active" ? (
                  <button
                    onClick={() => updateCron({ id: cron._id, status: "paused" })}
                    className="px-3 py-1 text-sm bg-yellow-900/50 hover:bg-yellow-900 text-yellow-400 rounded-lg transition-colors"
                  >
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={() => updateCron({ id: cron._id, status: "active" })}
                    className="px-3 py-1 text-sm bg-green-900/50 hover:bg-green-900 text-green-400 rounded-lg transition-colors"
                  >
                    Resume
                  </button>
                )}
                <button
                  onClick={() => deleteCron({ id: cron._id })}
                  className="px-3 py-1 text-sm bg-red-900/50 hover:bg-red-900 text-red-400 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            
            {cron.description && (
              <p className="text-gray-400 text-sm mt-2 ml-8">{cron.description}</p>
            )}
            
            <div className="flex items-center gap-6 mt-4 ml-8 text-xs text-gray-500">
              <span>
                📊 Runs: <span className="text-white">{cron.runCount || 0}</span>
              </span>
              {cron.lastRun && (
                <span>
                  ⏱️ Last: <span className="text-white">{formatTime(cron.lastRun)}</span>
                </span>
              )}
              {cron.nextRun && (
                <span>
                  ⏭️ Next: <span className="text-white">{formatTime(cron.nextRun)}</span>
                </span>
              )}
            </div>
            
            {cron.lastOutput && (
              <div className="mt-3 ml-8 p-3 bg-gray-800 rounded-lg text-xs font-mono text-gray-400 max-h-20 overflow-auto">
                {cron.lastOutput}
              </div>
            )}
          </div>
        ))}

        {(!cronJobs || cronJobs.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-5xl mb-3">⏰</p>
            <p className="text-lg">No cron jobs configured</p>
            <p className="text-sm mt-1">Add your first scheduled task to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, count, color, icon }: { title: string; count: number; color: string; icon: string }) {
  const colorClasses = {
    green: "bg-green-900/30 border-green-800 text-green-400",
    yellow: "bg-yellow-900/30 border-yellow-800 text-yellow-400",
    red: "bg-red-900/30 border-red-800 text-red-400",
  }[color] || "";
  
  return (
    <div className={`p-4 rounded-xl border ${colorClasses}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{title}</p>
          <p className="text-3xl font-bold">{count}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

function formatTime(ts: number): string {
  const date = new Date(ts);
  const now = new Date();
  
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  
  return date.toLocaleDateString([], { month: "short", day: "numeric" }) + " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
