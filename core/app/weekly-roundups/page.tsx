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
  title: "Weekly Roundups | The Cloud Rain",
  description:
    "Browse weekly open-source tool roundups, developer picks, and self-hosted software summaries from The Cloud Rain.",
  keywords: [
    "weekly roundups",
    "open source tool roundups",
    "developer tools",
    "self-hosted software"
  ],
  alternates: {
    canonical: "/weekly-roundups"
  },
  openGraph: {
    title: "Weekly Roundups | The Cloud Rain",
    description:
      "Browse weekly open-source tool roundups, developer picks, and self-hosted software summaries from The Cloud Rain.",
    type: "website",
    url: `${siteUrl}/weekly-roundups`
  },
  twitter: {
    card: "summary_large_image",
    title: "Weekly Roundups | The Cloud Rain",
    description:
      "Browse weekly open-source tool roundups, developer picks, and self-hosted software summaries from The Cloud Rain."
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

  if (error) {
    throw new Error(`Failed to fetch weekly roundups: ${error.message}`);
  }

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
    <div className="min-h-screen bg-gradient-to-br from-black via-[#08101f] to-[#071521] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Weekly Roundups</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Weekly open-source tool roundups</h1>
          <p className="max-w-3xl text-sm leading-7 text-white/70 md:text-base">
            Browse curated weekly briefs covering open-source developer tools, self-hosted software, and practical
            alternatives for builders.
          </p>
        </header>

        <section className="space-y-4">
          {roundups.length > 0 ? (
            roundups.map((roundup) => (
              <article
                key={roundup.id}
                className="rounded-3xl border-2 border-cyan-400 bg-white/10 p-6 shadow-lg"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-cyan-200/70">Weekly Roundup</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{roundup.title}</h2>
                    <p className="mt-2 text-sm text-white/60">{formatWeekDate(roundup.week_date)}</p>
                  </div>

                  <Link
                    href={`/weekly-roundups/${roundup.slug}`}
                    className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                  >
                    Read Roundup
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-white/70">
              Weekly roundups coming soon. Check back later.
            </article>
          )}
        </section>
      </div>
    </div>
  );
}