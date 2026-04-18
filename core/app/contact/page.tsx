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
  sameAs: ["https://github.com/Dineshwev"]
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


