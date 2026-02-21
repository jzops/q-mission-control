"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

type EventType = "task" | "cron" | "meeting";

export default function CalendarPage() {
  const events = useQuery(api.events.list);
  const createEvent = useMutation(api.events.create);
  const completeEvent = useMutation(api.events.complete);
  const deleteEvent = useMutation(api.events.remove);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "task" as EventType,
    startTime: "",
    recurring: "",
  });

  const handleCreate = async () => {
    if (!newEvent.title.trim() || !newEvent.startTime) return;
    await createEvent({
      title: newEvent.title,
      type: newEvent.type,
      startTime: new Date(newEvent.startTime).getTime(),
      recurring: newEvent.recurring || undefined,
    });
    setNewEvent({ title: "", type: "task", startTime: "", recurring: "" });
    setShowAddForm(false);
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case "cron": return "🔄";
      case "meeting": return "👥";
      default: return "✅";
    }
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case "cron": return "border-l-purple-500";
      case "meeting": return "border-l-blue-500";
      default: return "border-l-green-500";
    }
  };

  // Group events by date
  const groupedEvents = events?.reduce((acc, event) => {
    const date = new Date(event.startTime).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Calendar</h2>
          <p className="text-gray-400">Scheduled tasks and cron jobs</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
        >
          + Schedule Event
        </button>
      </div>

      {/* Add Event Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-xl font-bold mb-4">📅 Schedule Event</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
                  placeholder="Event title..."
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Type</label>
                <div className="flex gap-2">
                  {(["task", "cron", "meeting"] as EventType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewEvent({ ...newEvent, type })}
                      className={`flex-1 px-3 py-2 rounded-lg border transition-colors ${
                        newEvent.type === type
                          ? "border-green-500 bg-green-900/50"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      {getEventIcon(type)} {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
              {newEvent.type === "cron" && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cron Expression</label>
                  <input
                    type="text"
                    value={newEvent.recurring}
                    onChange={(e) => setNewEvent({ ...newEvent, recurring: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
                    placeholder="0 9 * * *"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar View */}
      <div className="space-y-6">
        {groupedEvents &&
          Object.entries(groupedEvents)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayEvents]) => (
              <div key={date} className="bg-gray-900 rounded-xl p-5 border border-gray-800">
                <h3 className="font-semibold mb-4 text-lg">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="space-y-3">
                  {dayEvents?.map((event) => (
                    <div
                      key={event._id}
                      className={`bg-gray-800 rounded-lg p-4 border-l-4 ${getEventColor(event.type)} ${
                        event.completed ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getEventIcon(event.type)}</span>
                          <div>
                            <span className={`font-medium ${event.completed ? "line-through" : ""}`}>
                              {event.title}
                            </span>
                            <div className="text-sm text-gray-400">
                              {new Date(event.startTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {event.recurring && (
                                <span className="ml-2 text-purple-400">🔄 {event.recurring}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!event.completed && (
                            <button
                              onClick={() => completeEvent({ id: event._id })}
                              className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
                            >
                              Complete
                            </button>
                          )}
                          <button
                            onClick={() => deleteEvent({ id: event._id })}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        {(!events || events.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-4xl mb-2">📅</p>
            <p>No events scheduled</p>
          </div>
        )}
      </div>
    </div>
  );
}
