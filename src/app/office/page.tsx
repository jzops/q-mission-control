"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function OfficePage() {
  const agents = useQuery(api.agents.list);
  const activity = useQuery(api.agents.getActivity, { limit: 10 });

  // Create office layout positions
  const positions = [
    { x: 15, y: 20 },
    { x: 45, y: 20 },
    { x: 75, y: 20 },
    { x: 15, y: 55 },
    { x: 45, y: 55 },
    { x: 75, y: 55 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Office</h2>
        <p className="text-gray-400">Watch your digital team at work</p>
      </div>

      {/* Office Floor Plan */}
      <div className="relative bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl border border-gray-800 h-[500px] overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Q's Desk - Center */}
        <div className="absolute left-1/2 top-[15%] -translate-x-1/2 text-center">
          <div className="relative">
            {/* Desk */}
            <div className="w-32 h-16 bg-gray-800 rounded-lg border-2 border-purple-600 shadow-lg shadow-purple-900/30">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="text-4xl animate-bounce">⚡</div>
              </div>
              <div className="h-full flex items-center justify-center">
                <div className="w-8 h-6 bg-gray-700 rounded"></div>
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-purple-300">Q</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Working</span>
            </div>
          </div>
        </div>

        {/* Sub-agent Desks */}
        {agents?.map((agent, index) => {
          const pos = positions[index % positions.length];
          const isWorking = agent.status === "working";
          
          return (
            <div
              key={agent._id}
              className="absolute transition-all duration-500"
              style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative">
                {/* Desk */}
                <div className={`w-24 h-14 bg-gray-800 rounded-lg border-2 ${
                  isWorking ? "border-green-600 shadow-lg shadow-green-900/30" : "border-gray-700"
                }`}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <div className={`text-3xl ${isWorking ? "animate-bounce" : ""}`}>
                      {agent.avatar || "🤖"}
                    </div>
                  </div>
                  {/* Monitor */}
                  <div className="h-full flex items-center justify-center">
                    <div className={`w-6 h-5 rounded ${
                      isWorking ? "bg-blue-500/50 animate-pulse" : "bg-gray-700"
                    }`}></div>
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium text-center">{agent.name}</p>
                {isWorking && agent.currentTask && (
                  <p className="text-xs text-center text-green-400 mt-1 max-w-24 truncate">
                    {agent.currentTask}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty desks placeholder */}
        {(!agents || agents.length === 0) && (
          <>
            {positions.slice(0, 4).map((pos, i) => (
              <div
                key={i}
                className="absolute"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-24 h-14 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center">
                  <span className="text-gray-600 text-xs">Empty</span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Coffee machine */}
        <div className="absolute right-4 bottom-4 text-center">
          <div className="text-2xl">☕</div>
          <p className="text-xs text-gray-500">Break Room</p>
        </div>

        {/* Plant */}
        <div className="absolute left-4 bottom-4 text-2xl">🪴</div>
      </div>

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activity && activity.length > 0 ? (
              activity.map((act) => (
                <div key={act._id} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                  <span className="text-xl">📌</span>
                  <div>
                    <p className="text-sm">{act.action}</p>
                    {act.details && (
                      <p className="text-xs text-gray-400">{act.details}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(act.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className="font-semibold mb-4">Team Status</h3>
          <div className="space-y-4">
            {/* Q Status */}
            <div className="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg border border-purple-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <span className="font-medium">Q</span>
                  <p className="text-xs text-gray-400">Primary Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400">Online</span>
              </div>
            </div>

            {/* Other agents */}
            {agents?.map((agent) => (
              <div
                key={agent._id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  agent.status === "working" ? "bg-green-900/20" : "bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.avatar || "🤖"}</span>
                  <div>
                    <span className="font-medium">{agent.name}</span>
                    <p className="text-xs text-gray-400">{agent.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === "working" ? "bg-green-500 animate-pulse" :
                    agent.status === "idle" ? "bg-yellow-500" : "bg-gray-500"
                  }`}></div>
                  <span className={`text-sm capitalize ${
                    agent.status === "working" ? "text-green-400" :
                    agent.status === "idle" ? "text-yellow-400" : "text-gray-400"
                  }`}>
                    {agent.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
