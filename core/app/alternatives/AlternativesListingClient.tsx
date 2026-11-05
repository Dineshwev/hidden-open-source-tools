"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Alternative = {
  id: string;
  saas_name: string;
  saas_slug: string;
  saas_description: string;
};

interface AlternativesListingClientProps {
  alternatives: Alternative[];
}

type SortOption = "az" | "za" | "latest";

export default function AlternativesListingClient({ alternatives }: AlternativesListingClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("az"); // default A→Z

  const filteredAndSorted = useMemo(() => {
    let result = alternatives;

    // Filter by search term on saas_name
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((a) => a.saas_name.toLowerCase().includes(q));
    }

    // Sort according to sortBy
    result = [...result].sort((a, b) => {
      if (sortBy === "az") {
        return a.saas_name.localeCompare(b.saas_name);
      }
      if (sortBy === "za") {
        return b.saas_name.localeCompare(a.saas_name);
      }
      if (sortBy === "latest") {
        // Fallback: sort by id descending (assuming newer entries have larger ids)
        return b.id.localeCompare(a.id);
      }
      return 0;
    });

    return result;
  }, [alternatives, search, sortBy]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search alternatives (e.g. Notion, Jira, Firebase)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/40 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/50 mr-2">Sort by:</span>
            {(
              [
                { id: "az", label: "A→Z" },
                { id: "za", label: "Z→A" },
                { id: "latest", label: "Latest First" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id as SortOption)}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                  sortBy === opt.id
                    ? "border-cyan-300 bg-cyan-300 text-slate-950 font-semibold"
                    : "border-white/20 text-white/70 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Jump Popular SaaS Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-white/40 mr-1">
            Popular:
          </span>
          {["Notion", "Firebase", "Jira", "Google Analytics", "Airtable", "Algolia", "Slack", "Heroku"].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSearch(search === name ? "" : name)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                search === name
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "border border-white/10 bg-white/5 text-white/70 hover:border-cyan-400/30 hover:bg-white/10 hover:text-white"
              }`}
            >
              {name}
            </button>
          ))}
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs text-white/40 hover:text-white underline ml-1"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-white/40">{filteredAndSorted.length} alternatives</p>

      {filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-white/50">No alternatives match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((alt) => (
            <Link
              key={alt.id}
              href={`/alternatives/${alt.saas_slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {alt.saas_name}
                  </h3>
                  <span className="text-xs text-cyan-300/80 group-hover:text-cyan-200 transition">
                    View →
                  </span>
                </div>
                <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
                  {alt.saas_description}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                <span>Verified open source</span>
                <span className="font-medium text-cyan-300/70">Self-hostable</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
