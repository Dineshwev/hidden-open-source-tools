import { getAdmin } from "@/lib/backend_lib/supabase-server";
import type { Metadata } from "next";
import Link from "next/link";

type WeeklyRoundupRow = {
  id: string;
  title: string;
  slug: string;
  week_date: string;
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "Weekly Open Source Tool Roundups | The Cloud Rain",
  description: "Weekly curated picks of the best open-source tools, self-hosted software, and developer utilities. New issue every Thursday.",
  keywords: ["weekly open source tools", "developer tools newsletter", "open source roundup", "self-hosted tools weekly"],
  alternates: { canonical: "/weekly-roundups" },
  openGraph: {
    title: "Weekly Roundups | The Cloud Rain",
    description: "Browse weekly open-source tool roundups, developer picks, and self-hosted software summaries from The Cloud Rain.",
    type: "website",
    url: `${siteUrl}/weekly-roundups`
  },
  twitter: {
    card: "summary_large_image",
    title: "Weekly Roundups | The Cloud Rain",
    description: "Browse weekly open-source tool roundups, developer picks, and self-hosted software summaries from The Cloud Rain."
  }
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getWeeklyRoundups(): Promise<WeeklyRoundupRow[]> {
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("weekly_roundups")
    .select("id, title, slug, week_date")
    .eq("status", "published")
    .order("week_date", { ascending: false });
  if (error) throw new Error(`Failed to fetch weekly roundups: ${error.message}`);
  return (data || []) as WeeklyRoundupRow[];
}

function formatWeekDate(weekDate: string): string {
  return new Date(weekDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export default async function WeeklyRoundupsPage() {
  const roundups = await getWeeklyRoundups();

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <section>
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Weekly Roundups</p>
        <h1 className="mt-2 font-display text-4xl text-white md:text-5xl">
          Weekly open-source tool roundups
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
          Curated weekly briefs covering open-source developer tools, self-hosted software,
          and practical alternatives for builders. New issue every week.
        </p>
      </section>

      <section className="space-y-4">
        {roundups.length > 0 ? (
          roundups.map((roundup) => (
            <article
              key={roundup.id}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/35">Weekly Roundup</p>
                  <h2 className="mt-2 text-xl text-white group-hover:text-cyan-300 transition-colors">
                    {roundup.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-white/45">{formatWeekDate(roundup.week_date)}</p>
                </div>
                <Link
                  href={`/weekly-roundups/${roundup.slug}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:border-white/30 hover:text-white"
                >
                  Read Roundup →
                </Link>
              </div>
            </article>
          ))
        ) : (
          <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/40">
            Weekly roundups coming soon. Check back later.
          </article>
        )}
      </section>
    </div>
  );
}