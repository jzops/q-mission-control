"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  maker: { label: "Maker", color: "bg-purple-500", icon: "🛠️" },
  sop: { label: "SOP", color: "bg-blue-500", icon: "📋" },
  tool: { label: "Tool", color: "bg-green-500", icon: "🔧" },
  internal: { label: "Internal", color: "bg-yellow-500", icon: "🏢" },
};

// Popular marketplace skills (curated)
const marketplaceCategories = [
  {
    name: "Sales & CRM",
    icon: "💼",
    skills: [
      { name: "HubSpot", domain: "hubspot.com", description: "CRM data, contacts, deals, pipelines", downloads: 142 },
      { name: "Salesforce", domain: "salesforce.com", description: "Enterprise CRM APIs", downloads: 89 },
      { name: "LinkedIn", domain: "linkedin.com", description: "Profile data, connections, messaging", downloads: 234 },
      { name: "Apollo", domain: "apollo.io", description: "Lead enrichment and prospecting", downloads: 67 },
    ],
  },
  {
    name: "Social Media",
    icon: "📱",
    skills: [
      { name: "Twitter/X", domain: "x.com", description: "Tweets, timelines, search", downloads: 456 },
      { name: "Reddit", domain: "reddit.com", description: "Posts, comments, subreddits", downloads: 178 },
      { name: "Instagram", domain: "instagram.com", description: "Posts, stories, profiles", downloads: 312 },
      { name: "TikTok", domain: "tiktok.com", description: "Videos, trends, analytics", downloads: 89 },
    ],
  },
  {
    name: "Productivity",
    icon: "⚡",
    skills: [
      { name: "Notion", domain: "notion.so", description: "Pages, databases, blocks", downloads: 267 },
      { name: "Linear", domain: "linear.app", description: "Issues, projects, cycles", downloads: 123 },
      { name: "Slack", domain: "slack.com", description: "Messages, channels, users", downloads: 198 },
      { name: "Airtable", domain: "airtable.com", description: "Bases, tables, records", downloads: 145 },
    ],
  },
  {
    name: "Data & Analytics",
    icon: "📊",
    skills: [
      { name: "Google Analytics", domain: "analytics.google.com", description: "Traffic, events, conversions", downloads: 87 },
      { name: "Mixpanel", domain: "mixpanel.com", description: "Product analytics, funnels", downloads: 56 },
      { name: "Amplitude", domain: "amplitude.com", description: "User analytics, cohorts", downloads: 43 },
      { name: "npm Registry", domain: "npmjs.org", description: "Package downloads, stats", downloads: 67 },
    ],
  },
];

export default function SkillsPage() {
  const skills = useQuery(api.skills.list, {});
  const [selectedSkill, setSelectedSkill] = useState<Id<"skills"> | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"leanscale" | "marketplace">("leanscale");
  const [marketplaceSearch, setMarketplaceSearch] = useState("");

  const selectedSkillData = skills?.find((s) => s._id === selectedSkill);

  const filteredSkills = skills?.filter((skill) => {
    const matchesType = !filterType || skill.type === filterType;
    const matchesSearch = !searchQuery || 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Group by type
  const groupedSkills = filteredSkills?.reduce((acc, skill) => {
    if (!acc[skill.type]) acc[skill.type] = [];
    acc[skill.type].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);

  // Filter marketplace by search
  const filteredMarketplace = marketplaceCategories.map(cat => ({
    ...cat,
    skills: cat.skills.filter(s => 
      !marketplaceSearch || 
      s.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(marketplaceSearch.toLowerCase())
    )
  })).filter(cat => cat.skills.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Skills & SOPs</h2>
          <p className="text-gray-400">Internal playbooks & API marketplace</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-4">
        <button
          onClick={() => setActiveTab("leanscale")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "leanscale"
              ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          🏢 LeanScale Skills
        </button>
        <button
          onClick={() => setActiveTab("marketplace")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "marketplace"
              ? "bg-gradient-to-r from-green-600 to-cyan-600 text-white"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          🌐 Marketplace
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-white/20 rounded">1600+</span>
        </button>
      </div>

      {activeTab === "leanscale" ? (
        <>
          {/* Search and Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills..."
                className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType(null)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  !filterType ? "bg-cyan-600" : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                All
              </button>
              {Object.entries(typeLabels).map(([type, { label, icon }]) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                    filterType === type ? "bg-cyan-600" : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <span>{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
            <a
              href="https://github.com/jzops/Skills-and-SOPs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              Repo
            </a>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills List */}
            <div className="space-y-6">
              {groupedSkills && Object.entries(groupedSkills).map(([type, typeSkills]) => (
                <div key={type}>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span>{typeLabels[type]?.icon}</span>
                    <span>{typeLabels[type]?.label}s</span>
                    <span className="text-sm text-gray-500">({typeSkills?.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {typeSkills?.map((skill) => (
                      <button
                        key={skill._id}
                        onClick={() => setSelectedSkill(skill._id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          selectedSkill === skill._id
                            ? "bg-gray-800 border-cyan-500"
                            : "bg-gray-900 border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{skill.name}</h4>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {skill.description}
                            </p>
                          </div>
                          {skill.hasReferences && (
                            <span className="text-xs px-2 py-1 bg-gray-700 rounded">
                              📁 refs
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {(!skills || skills.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-4xl mb-2">📋</p>
                  <p>No skills synced yet</p>
                  <p className="text-sm mt-2">Skills will appear here when synced from GitHub</p>
                </div>
              )}
            </div>

            {/* Skill Detail */}
            <div className="lg:sticky lg:top-4">
              {selectedSkillData ? (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 text-xs rounded ${typeLabels[selectedSkillData.type]?.color}`}>
                          {typeLabels[selectedSkillData.type]?.icon} {typeLabels[selectedSkillData.type]?.label}
                        </span>
                        {selectedSkillData.hasReferences && (
                          <span className="px-2 py-1 text-xs bg-gray-700 rounded">
                            Has References
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold">{selectedSkillData.name}</h3>
                      <p className="text-gray-400 mt-1">{selectedSkillData.description}</p>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span>📂 {selectedSkillData.repoPath}</span>
                    <span>🔄 {new Date(selectedSkillData.lastSynced).toLocaleDateString()}</span>
                  </div>

                  {selectedSkillData.content && (
                    <div className="border-t border-gray-800 pt-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">SKILL.md Preview</h4>
                      <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                          {selectedSkillData.content.slice(0, 2000)}
                          {selectedSkillData.content.length > 2000 && "..."}
                        </pre>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <a
                      href={`https://github.com/jzops/Skills-and-SOPs/tree/main/${selectedSkillData.repoPath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-center transition-colors"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center text-gray-500">
                  <p className="text-4xl mb-2">👈</p>
                  <p>Select a skill to view details</p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Marketplace Tab */
        <div className="space-y-6">
          {/* Marketplace Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={marketplaceSearch}
                onChange={(e) => setMarketplaceSearch(e.target.value)}
                placeholder="Search marketplace skills..."
                className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-gradient-to-r from-green-900/50 to-cyan-900/50 rounded-xl p-4 border border-green-800">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-medium">Reverse-Engineered APIs</h4>
                <p className="text-sm text-gray-400 mt-1">
                  These skills capture internal APIs from popular websites. Install them to let your agents 
                  interact with services programmatically — no official API required.
                </p>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMarketplace.map((category) => (
              <div key={category.name} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </h3>
                <div className="space-y-3">
                  {category.skills.map((skill) => (
                    <div
                      key={skill.domain}
                      className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium">{skill.name}</h4>
                        <p className="text-xs text-gray-500">{skill.domain}</p>
                        <p className="text-sm text-gray-400 mt-1">{skill.description}</p>
                      </div>
                      <div className="text-right ml-4">
                        <span className="text-xs text-gray-500">{skill.downloads} installs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Browse Full Marketplace */}
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              Explore 1,600+ reverse-engineered API skills
            </p>
            <div className="flex justify-center gap-3">
              <a
                href="https://unbrowse.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 rounded-lg font-medium transition-all"
              >
                Browse Full Marketplace →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
