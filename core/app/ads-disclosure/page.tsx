import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Ads Disclosure | The Cloud Rain",
  description:
    "Learn how sponsored content is labeled on The Cloud Rain, how ad placements work, and how we prioritize user experience.",
  keywords: ["ads disclosure", "sponsored content", "ad policy", "The Cloud Rain ads"],
  alternates: {
    canonical: "/ads-disclosure"
  },
  openGraph: {
    title: "Ads Disclosure | The Cloud Rain",
    description:
      "Transparency page for ad placements, sponsor labeling, and user-first ad standards on The Cloud Rain.",
    url: `${siteUrl}/ads-disclosure`
  }
};

const adsDisclosureSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Ads Disclosure | The Cloud Rain",
  url: `${siteUrl}/ads-disclosure`,
  description:
    "Learn how sponsored content is labeled on The Cloud Rain, how ad placements work, and how we prioritize user experience.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  inLanguage: "en"
};

export default function AdsDisclosurePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(adsDisclosureSchema) }} />

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Ads Disclosure</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Sponsor transparency and ad policy</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          This page explains where sponsor ads appear, what ad providers may process, and how we keep ads from getting in the way of core browsing.
        </p>
        <p className="max-w-3xl text-white/65 leading-relaxed text-sm">
          Our ad disclosure policy is built around transparency, clear labeling, and minimal disruption. We balance monetization needs with user experience standards so core content remains accessible and trustworthy.
        </p>
      </div>

      <div className="space-y-6 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Our ad partner: Adsterra</h2>
          <p className="mt-3 text-sm">
            The Cloud Rain uses Adsterra as a primary ad provider for sponsor placements such as banners and native units.
          </p>
          <p className="mt-3 text-sm">
            Provider relationships may change over time as we test availability, quality, and user experience impact. If that happens, this page is where we explain the update instead of leaving ad behavior undocumented.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">How ads appear</h2>
          <p className="mt-3 text-sm">
            Sponsor content may appear as banners, social bars, popunders, native units, or optional smartlink offers near content sections. We place these units where users naturally pause so they are visible without blocking the task at hand.
          </p>
          <p className="mt-3 text-sm">
            Placement choices are guided by page purpose. Legal pages, editorial pages, and discovery pages should remain readable, and ads should not make core navigation or support information harder to access.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">How sponsor content is labeled</h2>
          <p className="mt-3 text-sm">
            We aim to label paid placements with terms like "Sponsored," "Ad," or equivalent visual cues so users can distinguish promotional content from editorial and community listings.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">What Adsterra may receive</h2>
          <p className="mt-3 text-sm">
            Adsterra may process basic technical information such as browser details, approximate location, referral context, or device signals needed to deliver, render, and measure sponsor placements. For details on Adsterra&apos;s privacy practices, see their privacy policy via their website.
          </p>
          <p className="mt-3 text-sm">
            This may include impression measurement, fraud prevention, frequency controls, or deciding which promotional unit to show. For broader information about how technical data is handled on the platform, see our Privacy Policy as well.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">No forced popups</h2>
          <p className="mt-3 text-sm">
            We avoid popup-heavy or deceptive ad flows. Sponsor links should open from a direct user click, and the page should remain usable even if a provider is unavailable.
          </p>
          <p className="mt-3 text-sm">
            If a format becomes too disruptive, misleading, or inconsistent with the rest of the product, we may disable it, reposition it, or replace it with a lower-friction format.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">User controls</h2>
          <p className="mt-3 text-sm">
            You can reduce certain ad behaviors by adjusting browser privacy settings, enabling content controls, or using tracking preference tools supported by your browser and region.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">User experience priority</h2>
          <p className="mt-3 text-sm">
            Ads should support the platform, not frustrate the user. If a sponsor unit fails to load, the page should continue functioning and still provide access to the main content.
          </p>
          <p className="mt-3 text-sm">
            We treat readability, loading stability, and trust as hard constraints. Monetization matters, but not enough to justify disguised buttons, clutter-heavy layouts, or sponsor behavior that makes the site feel unsafe or confusing.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Affiliate and partner links</h2>
          <p className="mt-3 text-sm">
            Some outbound links may be partner or affiliate links. Where applicable, those relationships help support platform operations while keeping core browsing features available without payment.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Contact for ad concerns</h2>
          <p className="mt-3 text-sm">
            If you believe a sponsor placement is misleading, broken, or inappropriate, contact support through the footer contact link and include the page URL and a short description of the issue.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Issue handling</h2>
          <p className="mt-3 text-sm">
            We review ad quality reports and may disable or replace units that conflict with our disclosure or user-experience standards.
          </p>
          <p className="mt-3 text-sm">
            Reports are most helpful when they include the exact page URL, a short description of what appeared, and whether the issue involved misleading copy, unexpected redirects, broken rendering, or content that seemed unsafe for a general developer audience.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Why this disclosure exists</h2>
          <p className="mt-3 text-sm">
            Sites that use sponsor placements should not leave users guessing about where monetization begins or how promotional units differ from editorial content. This page exists so the monetization layer is documented in the open rather than hidden behind ambiguous layout choices.
          </p>
          <p className="mt-3 text-sm">
            Transparent ad disclosures also help contributors, returning visitors, and search engines understand that promotional elements are labeled, reviewable, and part of a broader effort to keep the platform readable and trustworthy.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Related legal pages</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/privacy" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Privacy Policy</Link>
            <Link href="/terms" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Terms of Service</Link>
            <Link href="/copyright" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Copyright Policy</Link>
            <Link href="/dmca" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">DMCA Policy</Link>
          </div>
        </section>
      </div>
    </div>
  );
}


