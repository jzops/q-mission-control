"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

type Status = "todo" | "in_progress" | "done";
type Assignee = "human" | "ai";

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  const updateTaskStatus = useMutation(api.tasks.updateStatus);
  const deleteTask = useMutation(api.tasks.remove);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<Assignee>("human");
  const [showAddForm, setShowAddForm] = useState(false);

  const columns: { status: Status; title: string; color: string }[] = [
    { status: "todo", title: "To Do", color: "border-gray-600" },
    { status: "in_progress", title: "In Progress", color: "border-yellow-600" },
    { status: "done", title: "Done", color: "border-green-600" },
  ];

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    await createTask({
      title: newTaskTitle,
      assignee: newTaskAssignee,
    });
    setNewTaskTitle("");
    setShowAddForm(false);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId") as Id<"tasks">;
    await updateTaskStatus({ id: taskId, status });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Tasks Board</h2>
          <p className="text-gray-400">Track what you and Q are working on</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + Add Task
        </button>
      </div>

      {/* Add Task Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Add New Task</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Task title..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Assign to</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setNewTaskAssignee("human")}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      newTaskAssignee === "human"
                        ? "border-blue-500 bg-blue-900/50"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    👤 Joe
                  </button>
                  <button
                    onClick={() => setNewTaskAssignee("ai")}
                    className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                      newTaskAssignee === "ai"
                        ? "border-purple-500 bg-purple-900/50"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    🤖 Q
                  </button>
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
                  onClick={handleCreateTask}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-4">
        {columns.map((column) => (
          <div
            key={column.status}
            className={`bg-gray-900 rounded-xl p-4 border-t-4 ${column.color} min-h-[500px]`}
            onDrop={(e) => handleDrop(e, column.status)}
            onDragOver={handleDragOver}
          >
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              {column.title}
              <span className="text-sm text-gray-400">
                {tasks?.filter((t) => t.status === column.status).length ?? 0}
              </span>
            </h3>
            <div className="space-y-3">
              {tasks
                ?.filter((t) => t.status === column.status)
                .map((task) => (
                  <div
                    key={task._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task._id)}
                    className="bg-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:bg-gray-750 transition-colors group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-sm">{task.title}</span>
                      <button
                        onClick={() => deleteTask({ id: task._id })}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          task.assignee === "ai"
                            ? "bg-purple-900/50 text-purple-300"
                            : "bg-blue-900/50 text-blue-300"
                        }`}
                      >
                        {task.assignee === "ai" ? "🤖 Q" : "👤 Joe"}
                      </span>
                      {task.priority && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            task.priority === "high"
                              ? "bg-red-900/50 text-red-300"
                              : task.priority === "medium"
                              ? "bg-yellow-900/50 text-yellow-300"
                              : "bg-gray-700 text-gray-300"
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
