import type { Metadata } from "next";
import Link from "next/link";
import ContactPageClient from "@/components/contact/ContactPageClient";

const siteUrl = "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Dinesh with identified or anonymous messages. Private replies for identified messages and public community answers for anonymous queries.",
  keywords: ["contact the cloud rain", "developer resources contact", "free tools support"],
  alternates: {
    canonical: "/contact"
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dinesh",
  url: siteUrl,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${siteUrl}/contact`
  },
  sameAs: ["https://github.com/dineshwev", "https://x.com/TheCloudRain_"]
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ContactPageClient />

      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Public contact routes</p>
        <h2 className="mt-2 text-xl text-white">Reach The Cloud Rain outside the form</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          If you prefer public profile-based contact, you can also reach the project through GitHub and X. These links help users, collaborators, and search engines connect the platform to its active public identity.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="https://github.com/dineshwev"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/35 hover:bg-white/[0.05]"
          >
            GitHub: @dineshwev
          </a>
          <a
            href="https://x.com/TheCloudRain_"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/35 hover:bg-white/[0.05]"
          >
            X: @TheCloudRain_
          </a>
          <a
            href="mailto:dineshwev.tcr@gmail.com"
            className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-400 transition hover:bg-cyan-400/20"
          >
            Email: dineshwev.tcr@gmail.com
          </a>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Explore</p>
        <h2 className="mt-2 text-xl text-white">Popular developer search pages</h2>
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
    </>
  );
}


