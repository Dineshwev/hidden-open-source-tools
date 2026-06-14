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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search alternatives..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
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
                  ? "border-cyan-300 bg-cyan-300 text-slate-900 font-medium"
                  : "border-white/20 text-white/70 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
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
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
            >
              <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {alt.saas_name}
              </h3>
              <p className="mt-2 text-xs text-white/70 line-clamp-2">
                {alt.saas_description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
