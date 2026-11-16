"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Calculator, Check, Search, ShieldCheck } from "lucide-react";
import { VERIFIED_SAAS_PRICING } from "@/lib/pricing-data";

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

const CATEGORY_MAP: Record<string, string[]> = {
  "Cloud & DevOps": [
    "datadog", "vercel", "heroku", "render", "railway", "docker-desktop",
    "terraform", "hashicorp-vault", "pagerduty", "cloudflare", "new-relic", "splunk"
  ],
  "Developer Tools": [
    "postman", "sentry", "retool", "github", "gitlab", "supabase", "ngrok",
    "logrocket", "openai", "cursor"
  ],
  "Databases & Storage": [
    "redis", "pinecone", "google-drive", "dropbox", "minio", "algolia", "planetscale"
  ],
  "Productivity & Docs": [
    "notion", "airtable", "docusign", "calendly", "jira", "confluence",
    "miro", "trello", "evernote", "obsidian", "asana", "clickup", "monday"
  ],
  "CRM & Support": [
    "salesforce", "hubspot", "zendesk", "intercom"
  ],
  "Marketing & Social": [
    "mailchimp", "buffer", "hootsuite", "typeform", "bitly"
  ],
  "Communication": [
    "slack", "google-photos", "plex", "pocket"
  ],
};

const POPULAR_SEARCHES = [
  "Datadog", "DocuSign", "Vercel", "Retool", "Postman", "Auth0",
  "Salesforce", "Mailchimp", "Airtable", "Notion", "Slack", "Redis", "Terraform"
];

export default function AlternativesListingClient({ alternatives }: AlternativesListingClientProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("az");

  const categories = useMemo(() => ["All", ...Object.keys(CATEGORY_MAP)], []);

  const filteredAndSorted = useMemo(() => {
    let result = alternatives;

    // Filter by category
    if (selectedCategory !== "All") {
      const allowedSlugs = new Set(CATEGORY_MAP[selectedCategory] || []);
      result = result.filter((a) => allowedSlugs.has(a.saas_slug.toLowerCase()));
    }

    // Filter by search term on saas_name and description
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.saas_name.toLowerCase().includes(q) || a.saas_description.toLowerCase().includes(q)
      );
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
        return b.id.localeCompare(a.id);
      }
      return 0;
    });

    return result;
  }, [alternatives, search, selectedCategory, sortBy]);

  return (
    <div className="space-y-8">
      {/* Search & Sort Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Search alternatives (e.g. Datadog, DocuSign, Retool, Jira)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] pl-11 pr-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-400/40 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-white/50 mr-1 uppercase tracking-wider font-semibold">Sort:</span>
            {(
              [
                { id: "az", label: "A→Z" },
                { id: "za", label: "Z→A" },
                { id: "latest", label: "Newest" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id as SortOption)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  sortBy === opt.id
                    ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-sm shadow-cyan-400/20"
                    : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? "border border-cyan-400/40 bg-cyan-400/20 text-cyan-200 shadow-sm shadow-cyan-500/20"
                    : "border border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Quick Jump Popular SaaS Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mr-1">
            Trending:
          </span>
          {POPULAR_SEARCHES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                setSelectedCategory("All");
                setSearch(search === name ? "" : name);
              }}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                search === name
                  ? "bg-cyan-400 text-slate-950 font-bold"
                  : "border border-white/10 bg-white/5 text-white/70 hover:border-cyan-400/30 hover:bg-white/10 hover:text-white"
              }`}
            >
              {name}
            </button>
          ))}
          {(search || selectedCategory !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
              }}
              className="text-xs text-cyan-300 hover:text-cyan-200 underline ml-2"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-white/50">
        <p>Showing <span className="font-semibold text-white">{filteredAndSorted.length}</span> SaaS alternative hubs</p>
        <span className="text-[11px] text-white/40">Updated daily with verified pricing & Docker templates</span>
      </div>

      {filteredAndSorted.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-12 text-center space-y-3">
          <p className="text-white/60 text-sm">No alternatives match your current filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSelectedCategory("All");
            }}
            className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/20 transition"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredAndSorted.map((alt) => {
            const hasCalculator = Boolean(VERIFIED_SAAS_PRICING[alt.saas_slug.toLowerCase()]);

            return (
              <Link
                key={alt.id}
                href={`/alternatives/${alt.saas_slug}`}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] p-5 transition hover:border-cyan-400/40 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {alt.saas_name}
                    </h3>
                    <span className="text-xs text-cyan-300/80 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-white/60 line-clamp-2 leading-relaxed">
                    {alt.saas_description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-white/50">
                    <ShieldCheck className="h-3 w-3 text-cyan-400" />
                    <span>Verified OSS</span>
                  </span>

                  {hasCalculator && (
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 font-semibold text-emerald-300">
                      <Calculator className="h-3 w-3" />
                      <span>Cost Calc</span>
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
