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
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Scope of rights you grant</h2>
          <p className="mt-3 text-sm">
            When you upload content, you give The Cloud Rain a limited, non-exclusive, worldwide license to host, index, and display that content as part of the platform.
          </p>
          <p className="mt-3 text-sm">
            This license exists only to operate the service and does not transfer your copyright ownership to us.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Platform content</h2>
          <p className="mt-3 text-sm">
            The site layout, branding, code, copy, and visual components are protected as platform assets. Reuse should follow the applicable license or written permission.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Uploader responsibilities</h2>
          <p className="mt-3 text-sm">
            You are responsible for ensuring your uploads do not infringe copyright, trademark, or related rights. You should include accurate attribution and the correct license whenever a third-party license requires it.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Takedown requests</h2>
          <p className="mt-3 text-sm">
            If you believe material on the site infringes your copyright, submit a DMCA request with the file URL, proof of ownership, and a signed statement to the contact listed on the DMCA page.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Repeat infringement and enforcement</h2>
          <p className="mt-3 text-sm">
            Accounts or submitters who repeatedly violate intellectual property rules may be restricted, suspended, or removed. We may also disable related listings and preserve relevant moderation records for legal review.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold text-white">Questions and clarifications</h2>
          <p className="mt-3 text-sm">
            For ownership clarifications, licensing conflicts, or attribution fixes, contact support and include the exact page URL plus evidence of rights ownership. Clear reports help us act faster.
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


