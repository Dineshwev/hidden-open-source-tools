import Link from "next/link";

// Minimal mobile landing page version
export default function HomeMobileLanding() {
  return (
    <div className="space-y-10 pb-16">
      {/* Hero */}
      <section className="rounded-[1.9rem] border border-white/10 bg-white/[0.02] p-6 text-center">
        <h1 className="font-display text-3xl leading-tight text-white md:text-4xl">
          Open source alternatives<br />
          <span className="text-white/40">to every SaaS you pay for</span>
        </h1>
        <div className="mt-4 flex flex-col gap-2 items-center">
          <Link
            href="/free-tools"
            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
          >
            Browse all tools
          </Link>
          <Link
            href="/alternatives"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
          >
            Alternatives directory
          </Link>
        </div>
      </section>

      {/* Category pills */}
      <section>
        <p className="mb-4 text-xs uppercase tracking-[0.25em] text-white/35">
          Browse by category
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/free-tools`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
            >
              {cat.label}
              <span className="text-xs text-white/30">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* View all tools link */}
      <div className="text-center">
        <Link
          href="/free-tools"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-2.5 text-sm text-white/60 transition hover:border-white/30 hover:text-white"
        >
          View all tools →
        </Link>
      </div>
    </div>
  );
}

// Category data – kept in sync with Desktop version
const CATEGORIES = [
  { label: "Developer Tools", slug: "developer-tools", count: 116 },
  { label: "Self-Hosting", slug: "self-hosting-infrastructure", count: 58 },
  { label: "Analytics & Search", slug: "analytics-search", count: 41 },
  { label: "Media & Utilities", slug: "media-utilities", count: 44 },
  { label: "Productivity", slug: "productivity", count: 39 },
  { label: "Security", slug: "security", count: 17 },
  { label: "Business Tools", slug: "business-tools", count: 12 },
  { label: "Community", slug: "community-events", count: 16 },
];
