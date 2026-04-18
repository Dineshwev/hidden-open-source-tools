import type { Metadata } from "next";
import GeneralQueriesClient from "@/components/contact/GeneralQueriesClient";
import Link from "next/link";

export const metadata: Metadata = {
  title: "General Queries",
  description: "Anonymous questions answered publicly to help the whole community.",
  alternates: {
    canonical: "/general-queries"
  }
};

export default function GeneralQueriesPage() {
  return (
    <div className="space-y-8">
      <GeneralQueriesClient />

      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">How this works</p>
        <h2 className="mt-2 text-xl text-white">Why public anonymous answers exist</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          General Queries is the public support archive for anonymous questions sent through The Cloud Rain. Instead of letting useful answers disappear in private inboxes, this page turns common questions into a searchable support layer that can help the broader community.
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
          It is especially useful for questions about downloads, moderation, licensing, reporting issues, product direction, and how specific parts of the platform work. Public answers also reduce duplicate support load over time.
        </p>
      </section>

      <section className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Related pages</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/contact" className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
            Contact Support
          </Link>
          <Link href="/privacy" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Privacy Policy
          </Link>
          <Link href="/terms" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Terms of Service
          </Link>
          <Link href="/copyright" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Copyright Policy
          </Link>
        </div>
      </section>
    </div>
  );
}
