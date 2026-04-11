import type { Metadata } from "next";
import Link from "next/link";
import ResponsiveHomePage from "@/components/home/ResponsiveHomePage";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Free Tools, Open Source Software, and Hidden Gems for Developers",
  description:
    "Discover open source software, free developer tools, and hidden resources curated by The Cloud Rain. Browse trusted tools, templates, and mystery-box style discoveries.",
  keywords: [
    "open source software",
    "free tools for developers",
    "hidden developer tools",
    "best free software",
    "developer resource library",
    "The Cloud Rain"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "The Cloud Rain | Open Source Software and Free Tools",
    description:
      "Find high-quality open source software, free tools, and hidden developer resources in one curated platform.",
    url: siteUrl,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Open Source Software and Free Tools",
    description:
      "A curated hub for open source software, free tools, and hidden gems for developers."
  }
};

export default function HomePage() {
  return (
    <div className="space-y-8">
      <ResponsiveHomePage />

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Explore by intent</p>
        <h2 className="mt-2 text-2xl text-white">Popular developer search topics</h2>
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
        </div>
      </section>
    </div>
  );
}
