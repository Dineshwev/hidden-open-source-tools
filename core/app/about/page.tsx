import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "About The Cloud Rain",
  description:
    "Learn how The Cloud Rain curates free tools, open source software, and hidden developer resources with moderation-first quality control.",
  keywords: ["about the cloud rain", "developer resource platform", "moderated free tools"],
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    title: "About The Cloud Rain",
    description:
      "The Cloud Rain is a moderation-first platform for discovering free developer resources, open source software, and hidden tools.",
    url: `${siteUrl}/about`
  }
};

const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About The Cloud Rain",
  url: `${siteUrl}/about`,
  description:
    "About The Cloud Rain and its moderation-first approach to free tools, open source software, and hidden developer resources."
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">About</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Built like a real product team, not a hobby project</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          The Cloud Rain is a moderated download platform for creators, studios, and digital collectors. The goal is simple: keep the product understandable, lawful, mobile-friendly, and respectful of user attention.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">What we do</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            We host moderated digital resources, present them through a mystery box experience, and support the site with sponsor placements that stay out of the way.
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">What we avoid</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            We avoid hidden redirects, popup-heavy ad flows, and UI that blocks the user from completing the task they came to do.
          </p>
        </article>
      </div>

      <div className="rounded-[2rem] border border-cyan-300/15 bg-gradient-to-r from-[#10233b] to-[#14304d] p-8">
        <h2 className="text-2xl font-semibold text-white">Product principles</h2>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/70">
          <li>1. Clear disclosure for ads and sponsor placements.</li>
          <li>2. Moderation first for uploaded files and community content.</li>
          <li>3. Legal pages that explain ownership, licensing, and privacy in plain language.</li>
          <li>4. A layout that works on desktop and mobile without forcing extra steps.</li>
        </ul>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-white/45">Explore resources</p>
        <h2 className="mt-2 text-xl text-white">Developer discovery routes</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/best-free-developer-tools" className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Best Free Developer Tools
          </Link>
          <Link href="/open-source-software" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Open Source Software
          </Link>
          <Link href="/hidden-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Hidden Tools
          </Link>
          <Link href="/free-tools" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Free Tools
          </Link>
        </div>
      </section>
    </div>
  );
}
