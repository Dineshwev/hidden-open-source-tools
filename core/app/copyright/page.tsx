import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Copyright Policy | The Cloud Rain",
  description:
    "Understand ownership rules, uploader rights, takedown handling, and copyright enforcement standards on The Cloud Rain.",
  keywords: ["copyright policy", "content ownership", "uploader rights", "The Cloud Rain copyright"],
  alternates: {
    canonical: "/copyright"
  },
  openGraph: {
    title: "Copyright Policy | The Cloud Rain",
    description:
      "Ownership and copyright rules for user submissions and platform content on The Cloud Rain.",
    url: `${siteUrl}/copyright`
  }
};

const copyrightSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Copyright Policy | The Cloud Rain",
  url: `${siteUrl}/copyright`,
  description:
    "Understand ownership rules, uploader rights, takedown handling, and copyright enforcement standards on The Cloud Rain.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  inLanguage: "en"
};

export default function CopyrightPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(copyrightSchema) }} />

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Copyright</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Copyright policy and ownership</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed">
          This page explains who owns what, what rights you keep when uploading, and how copyright complaints are handled.
        </p>
        <p className="max-w-3xl text-white/65 leading-relaxed text-sm">
          It covers ownership of user submissions, ownership of platform assets, and the relationship between this policy and our DMCA process. The purpose is straightforward: protect original creators while maintaining a transparent resource platform.
        </p>
      </div>

      <div className="space-y-6 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Ownership</h2>
          <p className="mt-3 text-sm">
            Uploaders keep ownership of their own submissions unless a separate license is stated. By uploading content, you confirm you have rights to share it on this platform.
          </p>
          <p className="mt-3 text-sm">
            Ownership and platform visibility are separate ideas. A creator may still fully own a work while granting the platform limited rights to host, display, index, and review that work as part of the service.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Scope of rights you grant</h2>
          <p className="mt-3 text-sm">
            When you upload content, you give The Cloud Rain a limited, non-exclusive, worldwide license to host, index, and display that content as part of the platform.
          </p>
          <p className="mt-3 text-sm">
            This license exists only to operate the service and does not transfer your copyright ownership to us.
          </p>
          <p className="mt-3 text-sm">
            That operational license may include caching, preview generation, moderation review, or temporary restriction during an investigation. These actions help run the service, but they do not convert creator-owned work into platform-owned intellectual property.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Platform content</h2>
          <p className="mt-3 text-sm">
            The site layout, branding, code, copy, and visual components are protected as platform assets. Reuse should follow the applicable license or written permission.
          </p>
          <p className="mt-3 text-sm">
            This includes custom interface presentation, brand identifiers, editorial descriptions, and original platform copy. Linking to the site is generally fine, but copying branded product presentation or repackaging it as your own service is not.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Uploader responsibilities</h2>
          <p className="mt-3 text-sm">
            You are responsible for ensuring your uploads do not infringe copyright, trademark, or related rights. You should include accurate attribution and the correct license whenever a third-party license requires it.
          </p>
          <p className="mt-3 text-sm">
            If your upload contains third-party assets, bundled code, fonts, screenshots, or derivative material, you are responsible for confirming that redistribution is allowed and that required notices remain intact. Missing attribution or unclear authorship may delay publication or trigger removal.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Takedown requests</h2>
          <p className="mt-3 text-sm">
            If you believe material on the site infringes your copyright, submit a DMCA request with the file URL, proof of ownership, and a signed statement to the contact listed on the DMCA page.
          </p>
          <p className="mt-3 text-sm">
            Specific reports help us move faster. If several pages are involved, list each affected URL and explain what work is allegedly infringed so we can review the correct material without guessing.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Repeat infringement and enforcement</h2>
          <p className="mt-3 text-sm">
            Accounts or submitters who repeatedly violate intellectual property rules may be restricted, suspended, or removed. We may also disable related listings and preserve relevant moderation records for legal review.
          </p>
          <p className="mt-3 text-sm">
            Enforcement decisions may consider the number of incidents, the clarity of the evidence, whether the uploader corrected the issue after notice, and whether the conduct appears accidental or systematic.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Questions and clarifications</h2>
          <p className="mt-3 text-sm">
            For ownership clarifications, licensing conflicts, or attribution fixes, contact support and include the exact page URL plus evidence of rights ownership. Clear reports help us act faster.
          </p>
          <p className="mt-3 text-sm">
            The most useful reports explain the exact problem, such as unauthorized copying, missing credit, relicensing without permission, or false authorship claims. That level of detail helps us review the issue more accurately.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Relationship to license terms</h2>
          <p className="mt-3 text-sm">
            Copyright protection and license permissions often overlap. A work may remain fully protected by copyright while still being distributed under an open-source or conditional license. That is why this page should be read together with our License Information page.
          </p>
          <p className="mt-3 text-sm">
            If a listing description, uploader statement, and source repository license do not align, we may temporarily restrict visibility while the legal status is reviewed. This helps reduce confusion for users making implementation decisions based on directory listings.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Related legal pages</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dmca" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">DMCA Policy</Link>
            <Link href="/license" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">License Information</Link>
            <Link href="/terms" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Terms of Service</Link>
            <Link href="/privacy" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Privacy Policy</Link>
          </div>
        </section>
      </div>
    </div>
  );
}


