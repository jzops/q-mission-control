"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const relationshipEmojis: Record<string, string> = {
  family: "👨‍👩‍👧",
  team: "👥",
  client: "💼",
  contact: "📇",
};

const relationshipColors: Record<string, string> = {
  family: "from-pink-600 to-red-600",
  team: "from-blue-600 to-cyan-600",
  client: "from-green-600 to-emerald-600",
  contact: "from-gray-600 to-gray-500",
};

export default function PeoplePage() {
  const people = useQuery(api.people.list, {});
  const createPerson = useMutation(api.people.create);
  const deletePerson = useMutation(api.people.remove);
  const upcomingBirthdays = useQuery(api.people.getUpcomingBirthdays, { days: 30 });

  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [newPerson, setNewPerson] = useState({
    name: "",
    relationship: "contact" as "family" | "team" | "client" | "contact",
    company: "",
    email: "",
    phone: "",
    notes: "",
    avatar: "👤",
  });

  const handleCreate = async () => {
    if (!newPerson.name.trim()) return;
    await createPerson({
      name: newPerson.name,
      relationship: newPerson.relationship,
      company: newPerson.company || undefined,
      email: newPerson.email || undefined,
      phone: newPerson.phone || undefined,
      notes: newPerson.notes || undefined,
      avatar: newPerson.avatar,
    });
    setNewPerson({
      name: "",
      relationship: "contact",
      company: "",
      email: "",
      phone: "",
      notes: "",
      avatar: "👤",
    });
    setShowAddForm(false);
  };

  const filteredPeople = people?.filter((p) => {
    if (filter && p.relationship !== filter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const grouped = filteredPeople?.reduce((acc, person) => {
    if (!acc[person.relationship]) acc[person.relationship] = [];
    acc[person.relationship].push(person);
    return acc;
  }, {} as Record<string, typeof people>);

  const counts = {
    family: people?.filter(p => p.relationship === "family").length || 0,
    team: people?.filter(p => p.relationship === "team").length || 0,
    client: people?.filter(p => p.relationship === "client").length || 0,
    contact: people?.filter(p => p.relationship === "contact").length || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">People</h2>
          <p className="text-gray-400">Your network and relationships</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/20"
        >
          + Add Person
        </button>
      </div>

      {/* Upcoming Birthdays */}
      {upcomingBirthdays && upcomingBirthdays.length > 0 && (
        <div className="bg-gradient-to-r from-pink-900/30 to-purple-900/30 rounded-xl p-4 border border-pink-800">
          <h3 className="font-semibold text-pink-400 mb-2">🎂 Upcoming Birthdays</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {upcomingBirthdays.map((person) => (
              <div key={person._id} className="flex-shrink-0 bg-gray-800 rounded-lg p-3 text-center">
                <span className="text-2xl">{person.avatar || "👤"}</span>
                <p className="text-sm font-medium mt-1">{person.name}</p>
                <p className="text-xs text-gray-400">
                  {person.birthday && new Date(person.birthday).toLocaleDateString([], { month: "short", day: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search people..."
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <FilterButton
            active={filter === null}
            onClick={() => setFilter(null)}
            label="All"
            count={people?.length || 0}
          />
          <FilterButton
            active={filter === "family"}
            onClick={() => setFilter("family")}
            label="Family"
            count={counts.family}
            emoji="👨‍👩‍👧"
          />
          <FilterButton
            active={filter === "team"}
            onClick={() => setFilter("team")}
            label="Team"
            count={counts.team}
            emoji="👥"
          />
          <FilterButton
            active={filter === "client"}
            onClick={() => setFilter("client")}
            label="Clients"
            count={counts.client}
            emoji="💼"
          />
          <FilterButton
            active={filter === "contact"}
            onClick={() => setFilter("contact")}
            label="Contacts"
            count={counts.contact}
            emoji="📇"
          />
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-800 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">👤 Add Person</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input
                  type="text"
                  value={newPerson.name}
                  onChange={(e) => setNewPerson({ ...newPerson, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Full name..."
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Relationship</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["family", "team", "client", "contact"] as const).map((rel) => (
                    <button
                      key={rel}
                      onClick={() => setNewPerson({ ...newPerson, relationship: rel })}
                      className={`px-3 py-2 rounded-lg border text-sm flex items-center gap-2 transition-all ${
                        newPerson.relationship === rel
                          ? `bg-gradient-to-r ${relationshipColors[rel]} border-transparent`
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <span>{relationshipEmojis[rel]}</span>
                      <span className="capitalize">{rel}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Company</label>
                <input
                  type="text"
                  value={newPerson.company}
                  onChange={(e) => setNewPerson({ ...newPerson, company: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Company name..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={newPerson.email}
                    onChange={(e) => setNewPerson({ ...newPerson, email: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="email@..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newPerson.phone}
                    onChange={(e) => setNewPerson({ ...newPerson, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
                    placeholder="+1..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea
                  value={newPerson.notes}
                  onChange={(e) => setNewPerson({ ...newPerson, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 h-20 resize-none"
                  placeholder="Additional notes..."
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-medium transition-all"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* People List by Category */}
      <div className="space-y-6">
        {grouped && Object.entries(grouped).map(([relationship, people]) => (
          <div key={relationship}>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>{relationshipEmojis[relationship]}</span>
              <span className="capitalize">{relationship}</span>
              <span className="text-sm text-gray-500">({people?.length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {people?.map((person) => (
                <div
                  key={person._id}
                  className="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{person.avatar || "👤"}</span>
                      <div>
                        <h4 className="font-semibold">{person.name}</h4>
                        {person.company && (
                          <p className="text-sm text-gray-400">{person.company}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deletePerson({ id: person._id })}
                      className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all"
                    >
                      ×
                    </button>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-gray-400">
                    {person.email && (
                      <p className="flex items-center gap-2">
                        <span>📧</span>
                        <a href={`mailto:${person.email}`} className="hover:text-white transition-colors">
                          {person.email}
                        </a>
                      </p>
                    )}
                    {person.phone && (
                      <p className="flex items-center gap-2">
                        <span>📱</span>
                        <a href={`tel:${person.phone}`} className="hover:text-white transition-colors">
                          {person.phone}
                        </a>
                      </p>
                    )}
                    {person.lastContact && (
                      <p className="flex items-center gap-2 text-xs">
                        <span>🕐</span>
                        Last contact: {new Date(person.lastContact).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {person.notes && (
                    <p className="mt-2 text-xs text-gray-500 line-clamp-2">{person.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {(!filteredPeople || filteredPeople.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-5xl mb-3">👥</p>
            <p className="text-lg">No people found</p>
            <p className="text-sm mt-1">
              {searchQuery ? "Try a different search" : "Add your first contact"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  emoji?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
        active
          ? "bg-purple-600 text-white"
          : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
      }`}
    >
      {emoji && <span>{emoji}</span>}
      <span>{label}</span>
      <span className="text-xs opacity-70">({count})</span>
    </button>
  );
}
