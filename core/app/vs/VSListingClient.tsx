"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Comparison = {
  id: string;
  slug: string;
  tool_a: string;
  tool_b: string;
  created_at: string;
};

interface VSListingClientProps {
  comparisons: Comparison[];
}

type SortOption = "latest" | "oldest" | "az";

export default function VSListingClient({ comparisons }: VSListingClientProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");

  const filteredAndSorted = useMemo(() => {
    let result = comparisons;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.tool_a.toLowerCase().includes(q) ||
          c.tool_b.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "az") {
        return a.tool_a.localeCompare(b.tool_a);
      }
      return 0;
    });

    return result;
  }, [comparisons, search, sortBy]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search comparisons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/20 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-white/50 mr-2">Sort by:</span>
          {(
            [
              { id: "latest", label: "Latest First" },
              { id: "oldest", label: "Oldest First" },
              { id: "az", label: "A→Z" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
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

      <p className="text-sm text-white/40">
        {filteredAndSorted.length} comparisons
      </p>

      {filteredAndSorted.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-white/50">No comparisons found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((c) => (
            <Link
              key={c.id}
              href={`/vs/${c.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
            >
              <div>
                <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                  {c.tool_a} vs {c.tool_b}
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-white/40">
                  {new Date(c.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
                <span className="text-xs font-medium text-white/30 group-hover:text-cyan-300 transition-colors">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
