import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "License Information | The Cloud Rain",
  description:
    "Read licensing guidance for platform code, open-source resources, attribution requirements, and commercial reuse restrictions.",
  keywords: ["license information", "open source license", "attribution", "The Cloud Rain license"],
  alternates: {
    canonical: "/license"
  },
  openGraph: {
    title: "License Information | The Cloud Rain",
    description:
      "Licensing rules for platform assets and third-party developer resources listed on The Cloud Rain.",
    url: `${siteUrl}/license`
  }
};

const licenseSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "License Information | The Cloud Rain",
  url: `${siteUrl}/license`,
  description:
    "Read licensing guidance for platform code, open-source resources, attribution requirements, and commercial reuse restrictions.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  inLanguage: "en"
};

export default function LicensePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(licenseSchema) }} />

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">License Information</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Platform and Content Licensing</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed text-lg">
          This page explains what is licensed, who owns what, and what you can or cannot reuse from The Cloud Rain and from third-party resources listed on the platform.
        </p>
        <p className="max-w-3xl text-white/65 leading-relaxed text-sm">
          The goal is to reduce confusion around open-source licenses, attribution requirements, commercial use, and platform intellectual property. If you build products using listed tools, this page should be your licensing starting point.
        </p>
      </div>

      <div className="space-y-8 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">1. Core Platform Source Code</h2>
          <p className="text-sm leading-relaxed">
            The platform code, UI, and brand assets are proprietary unless a specific repository or file states otherwise. If no open-source license is shown, you should assume reuse is not allowed without written permission.
          </p>
          <p className="text-sm leading-relaxed">
            That includes custom interface structure, branded presentation, editorial copy, and original product assets that are specific to The Cloud Rain. A public repository or shared snippet may have its own license, but that does not automatically extend to the rest of the platform.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">2. Open-Source Resources & User Uploads</h2>
          <p className="text-sm leading-relaxed">
            Listed tools are licensed by their original authors. One item may be MIT, another may be Creative Commons, and another may have stricter limits.
          </p>
          <p className="text-sm leading-relaxed">
            Before using any resource in client or commercial work, check its LICENSE or README file directly. You are responsible for complying with that license.
          </p>
          <p className="text-sm leading-relaxed">
            Directory summaries are meant to help with discovery, not replace primary license documentation. If a listing description conflicts with the repository license file or README, the original source documentation should be treated as the more authoritative reference until clarified.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">3. Commercial Reuse and Whitelabeling</h2>
          <p className="text-sm leading-relaxed">
            You may not scrape, frame, or repackage The Cloud Rain's user interface, databases, or moderation queues to build a competing product. Direct syndication of our free tool feeds requires a partnership agreement and access to a sanctioned API key. Modifying or stripping our branding to sell access to free tools is strictly forbidden.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">4. Trademarks & Brand Guidelines</h2>
          <p className="text-sm leading-relaxed">
            The name "The Cloud Rain," "Cloud Rain," and all associated logos, color palettes, and typographic locked designs are trademarks of the platform. You may use our logo exclusively for the purpose of backlinking to our site or providing proper attribution in community circles.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">5. Attribution and Notice Requirements</h2>
          <p className="text-sm leading-relaxed">
            Many resources in the directory require attribution in source code, product credits, or distribution documents. You are responsible for reading and preserving required notices when reusing third-party tools.
          </p>
          <p className="text-sm leading-relaxed">
            Attribution rules vary widely. Some licenses only require preserving the original copyright notice, while others may require visible credit in documentation, packaging, or derivative distributions. Removing those notices may place your usage outside the scope of the license.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">6. No Warranty for Third-Party Licenses</h2>
          <p className="text-sm leading-relaxed">
            The Cloud Rain does not guarantee that third-party upload metadata is complete or error-free. Always verify the package license directly from the original repository or included license files before shipping to production.
          </p>
          <p className="text-sm leading-relaxed">
            This is especially important for bundles, mixed-media assets, templates with multiple dependencies, or older repositories where metadata may be incomplete. If the legal status is unclear, pause before distribution and verify the source material directly.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">7. License Conflict Reporting</h2>
          <p className="text-sm leading-relaxed">
            If you identify conflicting license statements, missing attribution, or suspicious reuse claims, contact support with the resource URL, evidence, and explanation. We may temporarily restrict visibility while the review is pending.
          </p>
          <p className="text-sm leading-relaxed">
            Reports are easier to review when they explain what the listing says, what the source license says, and where the mismatch appears. That lets us make more accurate moderation decisions without unnecessarily removing unrelated content.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">8. Updates to Licensing Guidance</h2>
          <p className="text-sm leading-relaxed">
            This page may be updated as platform scope, contributor workflows, or legal requirements evolve. Revisions become effective when published.
          </p>
          <p className="text-sm leading-relaxed">
            We update this guidance when new submission patterns appear, when support questions reveal recurring confusion, or when legal expectations around distribution and attribution become clearer over time.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">9. Practical Licensing Reminder</h2>
          <p className="text-sm leading-relaxed">
            The safest workflow is simple: read the original license, preserve required notices, check commercial-use terms, and confirm whether derivative works are allowed before you ship anything based on a third-party resource. A directory page can speed up discovery, but it should not be the only legal review step in your process.
          </p>
          <p className="text-sm leading-relaxed">
            If you are unsure, pause before distribution. A small amount of verification early on can prevent much larger copyright, attribution, or client-delivery problems later.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Related legal pages</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/copyright" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Copyright Policy</Link>
            <Link href="/dmca" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">DMCA Policy</Link>
            <Link href="/terms" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Terms of Service</Link>
            <Link href="/privacy" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Privacy Policy</Link>
          </div>
        </section>
      </div>
    </div>
  );
}


