"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Only run search when we have a debounced query
  const searchResults = useQuery(
    api.search.global,
    debouncedQuery.length >= 2 ? { query: debouncedQuery, limit: 8 } : "skip"
  );

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery("");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "task": return "✅";
      case "person": return "👤";
      case "memory": return "🧠";
      case "decision": return "🎯";
      case "draft": return "📧";
      default: return "📄";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "task": return "bg-blue-900/50 text-blue-300";
      case "person": return "bg-green-900/50 text-green-300";
      case "memory": return "bg-purple-900/50 text-purple-300";
      case "decision": return "bg-yellow-900/50 text-yellow-300";
      case "draft": return "bg-orange-900/50 text-orange-300";
      default: return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 text-sm transition-colors"
      >
        <span>🔍</span>
        <span className="flex-1 text-left">Search...</span>
        <kbd className="hidden sm:inline text-xs bg-gray-700 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      {/* Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-xl mx-4 shadow-2xl overflow-hidden">
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
              <span className="text-gray-400">🔍</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, people, memories, decisions..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                autoFocus
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="text-gray-400 hover:text-white text-xs"
              >
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto">
              {query.length < 2 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Type at least 2 characters to search
                </div>
              ) : searchResults === undefined ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Searching...
                </div>
              ) : searchResults.results.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="py-2">
                  {searchResults.results.map((result, index) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result.href)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                    >
                      <span className="text-lg">{getTypeIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${getTypeBadgeColor(result.type)}`}>
                        {result.type}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>
                <kbd className="bg-gray-800 px-1.5 py-0.5 rounded mr-1">↑↓</kbd>
                Navigate
              </span>
              <span>
                <kbd className="bg-gray-800 px-1.5 py-0.5 rounded mr-1">↵</kbd>
                Open
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
