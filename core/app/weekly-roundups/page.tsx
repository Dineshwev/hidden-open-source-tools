import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "Weekly Open Source Tool Roundups for Developers and DevOps",
  description:
    "Read weekly curated briefs on open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives for engineering teams.",
  keywords: [
    "weekly developer tool roundup",
    "open source tool discoveries",
    "self-hosted software updates"
  ],
  alternates: {
    canonical: "/weekly-roundups"
  },
  openGraph: {
    title: "Weekly Open Source Tool Roundups for Developers and DevOps",
    description:
      "Read weekly curated briefs on open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives for engineering teams.",
    url: `${siteUrl}/weekly-roundups`
  }
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: siteUrl
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Weekly Tool Briefs",
      item: `${siteUrl}/weekly-roundups`
    }
  ]
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Weekly Tool Briefs",
  url: `${siteUrl}/weekly-roundups`,
  description:
    "Editorial weekly briefs covering open-source developer tools, self-hosted software, and lightweight workflow alternatives.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  }
};

interface WeeklyRoundup {
  id: string;
  title: string;
  slug: string;
  week_date: string;
  featured_tools: Array<{
    name: string;
    summary: string;
  }>;
}

async function getPublishedRoundups(): Promise<WeeklyRoundup[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase keys not configured");
    return [];
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from("weekly_roundups")
      .select("id, title, slug, week_date, featured_tools")
      .eq("status", "published")
      .order("week_date", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Failed to fetch roundups:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Error fetching roundups:", err);
    return [];
  }
}

export default async function WeeklyRoundupsPage() {
  const roundups = await getPublishedRoundups();

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-2 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Weekly Tool Briefs</p>
        <h1 className="font-display text-3xl text-white md:text-5xl">Weekly open-source tool briefs for developers</h1>
        <p className="max-w-3xl text-white/70">
          Each week we publish curated picks across open-source software, self-hosted utilities, and lightweight SaaS alternatives so engineering teams can evaluate useful resources faster.
        </p>
      </header>

      <section className="space-y-4">
        {roundups.length > 0 ? (
          roundups.map((roundup) => (
            <article key={roundup.slug} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl text-white">{roundup.title}</h2>
              <p className="mt-2 text-sm text-white/70">
                {roundup.featured_tools && roundup.featured_tools.length > 0
                  ? `This week's curated picks featuring tools like ${roundup.featured_tools
                      .slice(0, 2)
                      .map((t) => t.name)
                      .join(" and ")} and more.`
                  : "Curated weekly picks of open-source tools and developer utilities."}
              </p>
              <Link
                href={`/weekly-roundups/${roundup.slug}`}
                className="mt-4 inline-flex rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Read Roundup
              </Link>
            </article>
          ))
        ) : (
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-white/70">Weekly roundups coming soon. Check back later for curated picks.</p>
          </article>
        )}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
        <h2 className="text-2xl text-white">How these roundups help discovery</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
          Weekly roundups give The Cloud Rain an editorial layer on top of the main directory. They help developers
          discover open-source software, no-cost resources, and developer utilities through short practical summaries instead of
          only raw listings. That makes the site more useful for comparison, recurring discovery, and intent-based browsing.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/free-tools" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Browse No-Cost Resources
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Developer Utilities
          </Link>
          <Link href="/best-free-developer-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Developer Tool Comparisons
          </Link>
        </div>
      </section>
    </div>
  );
}


