"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

// Organization data - easy to edit
const partners = [
  { name: "Anthony", title: "CEO", agent: "Ben" },
  { name: "Joe", title: "COO", agent: "Q" },
  { name: "Cam", title: "Partner", agent: "Brady", leads: "architects" },
  { name: "Jake", title: "Partner", agent: "Girth", leads: "engineers" },
  { name: "Bernardo", title: "Partner", agent: "Labrador-7", leads: "projects" },
  { name: "Yasin", title: "Partner", agent: "Solomon", leads: "education" },
];

const departments = {
  architects: {
    name: "Architects",
    color: "blue",
    team: [
      { name: "John", agent: "Archie" },
      { name: "Brian", agent: "Jimothy" },
      { name: "Derek", agent: "Rascal" },
      { name: "Izzy", agent: "Rufus" },
      { name: "Kaylee", agent: "Lee" },
    ],
    sharedAgents: [
      { name: "Notetaker", icon: "📝" },
      { name: "Taskmaker", icon: "✅" },
      { name: "Briefer", icon: "📊" },
      { name: "SLA Bot", icon: "💬" },
    ],
  },
  engineers: {
    name: "Engineers",
    color: "green",
    team: [
      { name: "Rodolfo", agent: "Rodolfo" },
      { name: "Diego", agent: null },
      { name: "Solange", agent: null },
      { name: "Christopher", agent: "Maxwell" },
      { name: "David", agent: null },
    ],
    sharedAgents: [
      { name: "CRM Admin", icon: "☁️" },
      { name: "MAP Admin", icon: "📧" },
      { name: "Enrichment", icon: "🧬" },
      { name: "Routing", icon: "🚦" },
      { name: "Attribution", icon: "📈" },
    ],
  },
  projects: {
    name: "Projects",
    color: "purple",
    team: [
      { name: "Kavean", agent: null },
      { name: "Eduardo", agent: "Edgar" },
    ],
    sharedAgents: [
      { name: "Market Map", icon: "🗺️" },
      { name: "CRM Migration", icon: "🔄" },
      { name: "Q2C", icon: "💰" },
    ],
  },
  education: {
    name: "Education",
    color: "orange",
    team: [{ name: "TBD", agent: null }],
    sharedAgents: [{ name: "TBD", icon: "📚" }],
  },
};

const labs = [
  { name: "AI Hacker", icon: "🔬" },
  { name: "Kaizen", icon: "⚡" },
  { name: "Lana", icon: "🧠" },
  { name: "Mr. Robot", icon: "🤖" },
  { name: "Moonshot", icon: "🚀" },
];

const customerBots = [
  { name: "Wealthbot", icon: "💎" },
  { name: "Fountainbot", icon: "⛲" },
  { name: "Solinkbot", icon: "🔗" },
];

export default function OfficePage() {
  const agents = useQuery(api.agents.list);
  const recentActivity = useQuery(api.activity.list, { limit: 5 });

  const getAgentStatus = (name: string | null) => {
    if (!name) return null;
    const agent = agents?.find((a) => a.name.toLowerCase() === name.toLowerCase());
    return agent || null;
  };

  const StatusDot = ({ status }: { status: string | undefined }) => (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        status === "working"
          ? "bg-green-500 animate-pulse"
          : status === "idle"
          ? "bg-yellow-500"
          : "bg-gray-500"
      }`}
    />
  );

  const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: "bg-blue-950/50", border: "border-blue-800", text: "text-blue-400" },
    green: { bg: "bg-green-950/50", border: "border-green-800", text: "text-green-400" },
    purple: { bg: "bg-purple-950/50", border: "border-purple-800", text: "text-purple-400" },
    orange: { bg: "bg-orange-950/50", border: "border-orange-800", text: "text-orange-400" },
    pink: { bg: "bg-pink-950/50", border: "border-pink-800", text: "text-pink-400" },
    cyan: { bg: "bg-cyan-950/50", border: "border-cyan-800", text: "text-cyan-400" },
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Organization</h2>
        <p className="text-gray-400">LeanScale team and AI agents</p>
      </div>

      {/* Partners Row */}
      <section>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Partners
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {partners.map((partner) => {
            const agentStatus = getAgentStatus(partner.agent);
            return (
              <div
                key={partner.name}
                className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{partner.name}</p>
                    <p className="text-xs text-gray-500">{partner.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-800">
                  <StatusDot status={agentStatus?.status} />
                  <span className="text-xs text-gray-400">🤖 {partner.agent}</span>
                </div>
                {agentStatus?.status === "working" && agentStatus.currentTask && (
                  <p className="text-xs text-green-400 mt-1 truncate">{agentStatus.currentTask}</p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Departments */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(departments).map(([key, dept]) => {
          const colors = colorClasses[dept.color];
          return (
            <div
              key={key}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-5`}
            >
              <h3 className={`font-bold text-lg mb-4 ${colors.text}`}>{dept.name}</h3>

              {/* Team Members */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Team</p>
                <div className="flex flex-wrap gap-2">
                  {dept.team.map((member) => {
                    const agentStatus = getAgentStatus(member.agent);
                    const isWorking = agentStatus?.status === "working";
                    return (
                      <div
                        key={member.name}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                          isWorking ? "bg-green-900/30 border border-green-800" : "bg-gray-800/50"
                        }`}
                      >
                        <span className="text-sm">{member.name}</span>
                        {member.agent && (
                          <>
                            <StatusDot status={agentStatus?.status} />
                            <span className="text-xs text-gray-500">🤖 {member.agent}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shared Agents */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Shared Agents</p>
                <div className="flex flex-wrap gap-2">
                  {dept.sharedAgents.map((agent) => {
                    const agentStatus = getAgentStatus(agent.name);
                    const isWorking = agentStatus?.status === "working";
                    return (
                      <div
                        key={agent.name}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs ${
                          isWorking
                            ? "bg-green-900/30 border border-green-800"
                            : "bg-gray-800/70 border border-gray-700"
                        }`}
                      >
                        <span>{agent.icon}</span>
                        <span>{agent.name}</span>
                        <StatusDot status={agentStatus?.status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Labs & Customer Bots */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Labs */}
        <div className="rounded-xl border border-pink-800 bg-pink-950/30 p-5">
          <h3 className="font-bold text-lg mb-4 text-pink-400">Labs</h3>
          <div className="flex flex-wrap gap-2">
            {labs.map((agent) => {
              const agentStatus = getAgentStatus(agent.name);
              const isWorking = agentStatus?.status === "working";
              return (
                <div
                  key={agent.name}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${
                    isWorking
                      ? "bg-green-900/30 border border-green-800"
                      : "bg-gray-800/50 border border-gray-700"
                  }`}
                >
                  <span>{agent.icon}</span>
                  <span>{agent.name}</span>
                  <StatusDot status={agentStatus?.status} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Bots */}
        <div className="rounded-xl border border-cyan-800 bg-cyan-950/30 p-5">
          <h3 className="font-bold text-lg mb-4 text-cyan-400">Customer Bots</h3>
          <div className="flex flex-wrap gap-2">
            {customerBots.map((bot) => {
              const agentStatus = getAgentStatus(bot.name);
              const isWorking = agentStatus?.status === "working";
              return (
                <div
                  key={bot.name}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${
                    isWorking
                      ? "bg-green-900/30 border border-green-800"
                      : "bg-gray-800/50 border border-gray-700"
                  }`}
                >
                  <span>{bot.icon}</span>
                  <span>{bot.name}</span>
                  <StatusDot status={agentStatus?.status} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Working Now */}
      {agents?.filter((a) => a.status === "working").length ? (
        <section className="bg-green-900/20 border border-green-800 rounded-xl p-5">
          <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Working Now
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents
              ?.filter((a) => a.status === "working")
              .map((agent) => (
                <div
                  key={agent._id}
                  className="bg-green-900/30 border border-green-800 rounded-lg p-3"
                >
                  <p className="font-medium">🤖 {agent.name}</p>
                  {agent.currentTask && (
                    <p className="text-sm text-green-300 mt-1">{agent.currentTask}</p>
                  )}
                </div>
              ))}
          </div>
        </section>
      ) : null}

      {/* Recent Activity */}
      <section className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity._id}
                className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50"
              >
                <span className="text-lg">
                  {activity.type === "task_started"
                    ? "▶️"
                    : activity.type === "task_completed"
                    ? "✅"
                    : activity.type === "email_drafted"
                    ? "📧"
                    : "📌"}
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
      </section>
    </div>
  );
}
