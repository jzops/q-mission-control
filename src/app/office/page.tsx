"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import mermaid from "mermaid";

// Mermaid org chart definition
const orgChartCode = `
flowchart TB
 subgraph A1["Anthony - CEO"]
        ANTHONY["👤"]
        BEN["🤖 Ben"]
  end
 subgraph A2["Joe - COO"]
        JOE["👤"]
        QAI["🤖 Q"]
  end
 subgraph A3["Cam - Partner"]
        CAM["👤"]
        POP["🤖 Brady"]
  end
 subgraph A4["Jake - Partner"]
        JAKE["👤"]
        GIRTH["🤖 Girth"]
  end
 subgraph A5["Bernardo - Partner"]
        BERNARDO["👤"]
        IRVING["🤖 Labrador-7"]
  end
 subgraph A6["Yasin - Partner"]
        YASIN["👤"]
        MACHINE["🤖 Solomon"]
  end
 subgraph PARTNERS["PARTNERS"]
    direction LR
        A1
        A2
        A3
        A4
        A5
        A6
  end
 subgraph ARCH_TEAM["Team"]
        JOHN["John 🤖 Archie"]
        BRIAN["Brian 🤖 Jimothy"]
        DEREK["Derek 🤖 Rascal"]
        IZZY["Izzy 🤖 Rufus"]
        KAYLEE["Kaylee 🤖 Lee"]
  end
 subgraph ARCH_AI["Shared Agents"]
        NOTETAKER["📝 Notetaker"]
        TASKMAKER["✅ Taskmaker"]
        BRIEFER["📊 Briefer"]
        UNTHREAD["💬 SLA Bot"]
  end
 subgraph ARCHITECTS["ARCHITECTS"]
    direction LR
        ARCH_TEAM
        ARCH_AI
  end
 subgraph ENG_TEAM["Team"]
        RODOLFO_P["Rodolfo 🤖 Rodolfo"]
        DIEGO["Diego"]
        SOLANGE["Solange"]
        CHRISTOPHER["Christopher 🤖 Maxwell"]
        DAVID["David"]
  end
 subgraph ENG_AI["Shared Agents"]
        CRM["☁️ CRM Admin"]
        MAP["📧 MAP Admin"]
        ENRICH["🧬 Enrichment"]
        ROUTING["🚦 Routing"]
        ATTRIB["📈 Attribution"]
  end
 subgraph ENGINEERS["ENGINEERS"]
    direction LR
        ENG_TEAM
        ENG_AI
  end
 subgraph PROJ_TEAM["Team"]
        KAVEAN["Kavean"]
        EDUARDO["Eduardo 🤖 Edgar"]
  end
 subgraph PROJ_AI["Shared Agents"]
        MMTOOL["🗺️ Market Map"]
        CRMTOOL["🔄 CRM Migration"]
        Q2CTOOL["💰 Q2C"]
  end
 subgraph PROJECTS["PROJECTS"]
    direction LR
        PROJ_TEAM
        PROJ_AI
  end
 subgraph EDU_TEAM["Team"]
        EDU_TBD["TBD"]
  end
 subgraph EDU_AI["Agents"]
        EDU_AI_TBD["TBD"]
  end
 subgraph EDUCATION["EDUCATION"]
    direction LR
        EDU_TEAM
        EDU_AI
  end
 subgraph CUSTBOTS["CUSTOMER BOTS"]
    direction LR
        WEALTHBOT["💎 Wealthbot"]
        FOUNTAINBOT["⛲ Fountainbot"]
        SOLINKBOT["🔗 Solinkbot"]
  end
 subgraph LABS["LABS"]
    direction LR
        HACKER["🔬 AI Hacker"]
        KAIZEN["⚡ Kaizen"]
        LANA["🧠 Lana"]
        MRROBOT["🤖 Mr. Robot"]
        MOONSHOT["🚀 Moonshot"]
  end
    CAM --> ARCHITECTS
    JAKE --> ENGINEERS & LABS
    BERNARDO --> PROJECTS
    YASIN --> EDUCATION
    ARCHITECTS --> CUSTBOTS
`;

export default function OfficePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const agents = useQuery(api.agents.list);
  const recentActivity = useQuery(api.activity.list, { limit: 5 });

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      themeVariables: {
        primaryColor: "#7c3aed",
        primaryTextColor: "#fff",
        primaryBorderColor: "#8b5cf6",
        lineColor: "#6b7280",
        secondaryColor: "#1f2937",
        tertiaryColor: "#111827",
        background: "#111827",
        mainBkg: "#1f2937",
        secondBkg: "#374151",
        border1: "#4b5563",
        border2: "#6b7280",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      },
      flowchart: {
        htmlLabels: true,
        curve: "basis",
      },
    });

    const renderChart = async () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
        const { svg } = await mermaid.render("org-chart", orgChartCode);
        containerRef.current.innerHTML = svg;
      }
    };

    renderChart();
  }, []);

  const getAgentStatus = (name: string) => {
    const agent = agents?.find((a) => a.name.toLowerCase() === name.toLowerCase());
    return agent || { status: "offline", currentTask: null };
  };

  // Get working agents for the status panel
  const workingAgents = agents?.filter((a) => a.status === "working") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Organization</h2>
        <p className="text-gray-400">LeanScale team structure and AI agents</p>
      </div>

      {/* Working Agents Status Bar */}
      {workingAgents.length > 0 && (
        <div className="bg-green-900/20 border border-green-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Currently Working
          </h3>
          <div className="flex flex-wrap gap-3">
            {workingAgents.map((agent) => (
              <div
                key={agent._id}
                className="flex items-center gap-2 bg-green-900/30 px-3 py-2 rounded-lg"
              >
                <span className="font-medium">{agent.name}</span>
                {agent.currentTask && (
                  <span className="text-xs text-green-300 truncate max-w-[200px]">
                    {agent.currentTask}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mermaid Org Chart */}
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 overflow-x-auto">
        <div
          ref={containerRef}
          className="mermaid-container min-h-[600px] flex items-center justify-center"
        />
      </div>

      {/* Agent Status Legend */}
      <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
        <h3 className="font-semibold mb-3">Agent Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {agents?.map((agent) => {
            const isWorking = agent.status === "working";
            const isIdle = agent.status === "idle";
            return (
              <div
                key={agent._id}
                className={`p-2 rounded-lg border ${
                  isWorking
                    ? "bg-green-900/20 border-green-800"
                    : isIdle
                    ? "bg-yellow-900/20 border-yellow-800"
                    : "bg-gray-800/50 border-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isWorking
                        ? "bg-green-500 animate-pulse"
                        : isIdle
                        ? "bg-yellow-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  <span className="text-sm font-medium truncate">{agent.name}</span>
                </div>
                {isWorking && agent.currentTask && (
                  <p className="text-xs text-green-400 mt-1 truncate">{agent.currentTask}</p>
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
      </div>
    </div>
  );
}
