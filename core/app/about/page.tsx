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
          The Cloud Rain is a moderated resource platform for creators, developers, and learners. Our goal is simple: make discovery fast, keep rules clear, and avoid wasting user attention.
        </p>
        <p className="max-w-3xl text-white/65 leading-relaxed text-sm">
          This About page explains how The Cloud Rain reviews free developer tools, open source software, UI kits, templates, and related resources. We publish clear moderation and policy standards so users, contributors, and search engines can understand how platform decisions are made.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">What we do</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            We host moderated digital resources, present them through a mystery box experience, and support the site with sponsor placements that stay out of the way.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            We try to add enough context around each discovery route that users can understand what a page is for, what kind of resource they are looking at, and how platform rules shape the experience. That includes clearer navigation, readable support pages, and moderation language that explains why a listing is visible.
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">What we avoid</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            We avoid hidden redirects, popup-heavy ad flows, and UI that blocks the user from completing the task they came to do.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            We also avoid vague platform language that leaves users guessing about ownership, licensing, moderation, or reporting. Support pages should explain how the site operates in enough detail that visitors, contributors, and search engines can understand the product without reverse-engineering it.
          </p>
        </article>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Who this is for</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            The platform is built for solo developers, early-stage teams, and learners who need practical tools fast. We focus on resources that are usable today, not just trendy links that go stale after a week.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            That means the site should still feel useful whether you are looking for free developer tools, browsing open source software, comparing resource directories, or simply trying to understand whether a download page is maintained with real operational standards.
          </p>
        </article>
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">How moderation works</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Submissions go through a review queue before they appear in discovery pages. We check for abuse signals, category quality, and license clarity so users can browse with confidence.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Review does not mean we guarantee a resource is perfect for every use case. It means we apply current platform checks for clarity, basic trust signals, and fit with the purpose of the directory before content is surfaced more broadly.
          </p>
        </article>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-white/45">Why this exists</p>
        <h2 className="mt-2 text-xl text-white">A clearer layer between browsing and trust</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          The web already has plenty of tool lists and resource collections. What is often missing is a useful layer of structure between a raw link and a real decision. The Cloud Rain is built to add that structure through moderation, disclosure, support pages, and product framing that helps people evaluate what they are seeing.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          We are not trying to replace original authors, licenses, or source repositories. We are trying to make discovery cleaner and more understandable so a visitor can move from curiosity to decision with less noise and less risk.
        </p>
      </section>

      <div className="rounded-[2rem] border border-cyan-300/15 bg-gradient-to-r from-[#10233b] to-[#14304d] p-8">
        <h2 className="text-2xl font-semibold text-white">Product principles</h2>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-white/70">
          <li>1. Clear disclosure for ads and sponsor placements.</li>
          <li>2. Moderation first for uploaded files and community content.</li>
          <li>3. Legal pages that explain ownership, licensing, and privacy in plain language.</li>
          <li>4. A layout that works on desktop and mobile without forcing extra steps.</li>
          <li>5. Fast browsing with progressive loading and clear fallbacks when services fail.</li>
          <li>6. Practical copywriting that helps users decide quickly and safely.</li>
        </ul>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-white/45">Trust and safety</p>
        <h2 className="mt-2 text-xl text-white">How we handle risk</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          We treat moderation, ownership, and transparency as core product features. That means clear policy pages, simple reporting routes, and checks before content appears in key discovery areas.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          If you spot suspicious content, broken links, misleading claims, or licensing issues, report it through our contact channel with the exact page URL. Reports with clear evidence are handled faster and help protect the broader community.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          We also try to design for edge cases. If an external provider fails, if a listing becomes outdated, or if a policy question comes up, the surrounding product should still remain understandable. Good support content reduces confusion even when something goes wrong.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-white/45">Roadmap direction</p>
        <h2 className="mt-2 text-xl text-white">What we are improving next</h2>
        <ul className="mt-4 space-y-2 text-sm leading-relaxed text-white/70">
          <li>1. Better non-technical onboarding for first-time visitors.</li>
          <li>2. Stronger queue insights for moderation and quality control.</li>
          <li>3. Easier mobile actions for browsing, reporting, and discovery.</li>
          <li>4. More trustworthy metadata around licensing and usage rights.</li>
          <li>5. Stronger supporting pages that document how the platform works.</li>
          <li>6. More meaningful internal links between policy, editorial, and discovery pages.</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-white/45">Operational standards</p>
        <h2 className="mt-2 text-xl text-white">Why supporting pages matter</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          About pages, copyright pages, privacy documents, license explanations, and ad disclosures are not filler content to us. They are part of the product architecture. They help users understand how the platform behaves, how disputes are handled, and what standards shape the experience.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          They also create a stronger trust layer for search engines and returning visitors by showing that the site is maintained with clear documentation rather than only marketing copy.
        </p>
      </section>

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


