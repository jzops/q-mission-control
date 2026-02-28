"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Org structure: Person -> Their Agent
const orgStructure = [
  {
    name: "Joe",
    title: "CEO",
    avatar: "👨‍💼",
    agents: [
      { name: "Q", role: "Chief of Staff" },
    ],
  },
  {
    name: "Cam",
    title: "Account Manager",
    avatar: "👤",
    agents: [
      { name: "Brady", role: "Cam's Agent" },
    ],
  },
  {
    name: "Brian",
    title: "Engineer",
    avatar: "👤",
    agents: [
      { name: "Jimothy", role: "Brian's Agent" },
    ],
  },
  {
    name: "Derek",
    title: "GTM Engineer",
    avatar: "👤",
    agents: [
      { name: "Rascal", role: "Derek's Agent" },
    ],
  },
  {
    name: "Izzy",
    title: "Support",
    avatar: "👤",
    agents: [
      { name: "Rufus", role: "Izzy's Agent" },
    ],
  },
  {
    name: "John",
    title: "Architect",
    avatar: "👤",
    agents: [
      { name: "Archie", role: "John's Agent" },
    ],
  },
  {
    name: "Christopher",
    title: "GTM Engineer",
    avatar: "👤",
    agents: [
      { name: "Maxwell", role: "Christopher's Agent" },
    ],
  },
  {
    name: "Eduardo",
    title: "Developer",
    avatar: "👤",
    agents: [
      { name: "Edgar", role: "Eduardo's Agent" },
    ],
  },
];

// Shared/Utility agents (not tied to a specific person)
const sharedAgents = [
  { name: "Girth Brooks", role: "Tech Operations" },
  { name: "Ben", role: "Finance & HR" },
  { name: "TaskMaster", role: "Task Management" },
  { name: "Labrador-7", role: "Research" },
  { name: "Rodolfo", role: "Operations" },
];

export default function OfficePage() {
  const agents = useQuery(api.agents.list);
  const recentActivity = useQuery(api.activity.list, { limit: 5 });

  const getAgentStatus = (name: string) => {
    const agent = agents?.find((a) => a.name.toLowerCase() === name.toLowerCase());
    return agent || { status: "offline", currentTask: null };
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold">Organization</h2>
        <p className="text-gray-400">Team members and their AI agents</p>
      </div>

      {/* Joe + Q at the top */}
      <div className="flex justify-center">
        <div className="text-center">
          {/* Joe */}
          <div className="inline-flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
              👨‍💼
            </div>
            <p className="mt-2 font-bold text-lg">Joe</p>
            <p className="text-sm text-gray-400">CEO</p>
          </div>

          {/* Connector line */}
          <div className="w-px h-8 bg-gray-700 mx-auto"></div>

          {/* Q */}
          <div className="inline-flex flex-col items-center">
            <AgentCard
              name="Q"
              role="Chief of Staff"
              status={getAgentStatus("Q")}
              isPrimary
            />
          </div>

          {/* Connector line to team */}
          <div className="w-px h-8 bg-gray-700 mx-auto"></div>
          <div className="w-full max-w-4xl h-px bg-gray-700 mx-auto"></div>
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {orgStructure.slice(1).map((person) => (
          <div key={person.name} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
            {/* Person */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-xl">
                {person.avatar}
              </div>
              <div>
                <p className="font-semibold">{person.name}</p>
                <p className="text-xs text-gray-400">{person.title}</p>
              </div>
            </div>

            {/* Their Agent(s) */}
            <div className="border-t border-gray-800 pt-3">
              <p className="text-xs text-gray-500 mb-2">AI AGENT</p>
              {person.agents.map((agent) => {
                const status = getAgentStatus(agent.name);
                return (
                  <AgentBadge
                    key={agent.name}
                    name={agent.name}
                    status={status}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Shared Agents */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <span>🤖</span> Shared AI Agents
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sharedAgents.map((agent) => {
            const status = getAgentStatus(agent.name);
            return (
              <div
                key={agent.name}
                className={`p-3 rounded-lg border ${
                  status.status === "working"
                    ? "bg-green-900/20 border-green-800"
                    : "bg-gray-800/50 border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full ${
                    status.status === "working" ? "bg-green-500 animate-pulse" :
                    status.status === "idle" ? "bg-yellow-500" : "bg-gray-500"
                  }`}></div>
                  <span className="font-medium text-sm">{agent.name}</span>
                </div>
                <p className="text-xs text-gray-400">{agent.role}</p>
                {status.status === "working" && status.currentTask && (
                  <p className="text-xs text-green-400 mt-1 truncate">{status.currentTask}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <h3 className="font-semibold mb-4">Recent Agent Activity</h3>
        <div className="space-y-2">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity._id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50">
                <span className="text-lg">
                  {activity.type === "task_started" ? "▶️" :
                   activity.type === "task_completed" ? "✅" :
                   activity.type === "email_drafted" ? "📧" : "📌"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentCard({
  name,
  role,
  status,
  isPrimary = false
}: {
  name: string;
  role: string;
  status: { status?: string; currentTask?: string | null };
  isPrimary?: boolean;
}) {
  const isWorking = status.status === "working";

  return (
    <div className={`p-4 rounded-xl border-2 ${
      isPrimary
        ? isWorking
          ? "bg-gradient-to-br from-purple-900/50 to-green-900/30 border-green-600"
          : "bg-gradient-to-br from-purple-900/50 to-gray-900 border-purple-600"
        : isWorking
          ? "bg-green-900/20 border-green-700"
          : "bg-gray-800 border-gray-700"
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
          isPrimary ? "bg-purple-900/50" : "bg-gray-700"
        }`}>
          ⚡
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{name}</span>
            <div className={`w-2 h-2 rounded-full ${
              isWorking ? "bg-green-500 animate-pulse" :
              status.status === "idle" ? "bg-yellow-500" : "bg-gray-500"
            }`}></div>
          </div>
          <p className="text-sm text-gray-400">{role}</p>
          {isWorking && status.currentTask && (
            <p className="text-xs text-green-400 mt-1">📌 {status.currentTask}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function AgentBadge({
  name,
  status
}: {
  name: string;
  status: { status?: string; currentTask?: string | null };
}) {
  const isWorking = status.status === "working";

  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${
      isWorking ? "bg-green-900/30" : "bg-gray-800"
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        isWorking ? "bg-green-500 animate-pulse" :
        status.status === "idle" ? "bg-yellow-500" : "bg-gray-500"
      }`}></div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium">{name}</span>
        {isWorking && status.currentTask && (
          <p className="text-xs text-green-400 truncate">{status.currentTask}</p>
        )}
      </div>
      <span className="text-lg">🤖</span>
    </div>
  );
}
