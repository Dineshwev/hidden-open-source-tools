import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, CheckCircle, Search, AlertCircle } from "lucide-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Security & Trust | The Cloud Rain",
  description: "Learn about The Cloud Rain's manual review process, security standards, and commitment to safe developer tool discovery.",
  alternates: {
    canonical: "/security"
  },
  openGraph: {
    title: "Security & Trust | The Cloud Rain",
    description:
      "Learn how The Cloud Rain handles review standards, trust signals, and safer developer tool discovery.",
    url: `${siteUrl}/security`
  }
};

export default function SecurityPage() {
  const securitySchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: "Security & Trust",
        url: `${siteUrl}/security`,
        description:
          "The Cloud Rain security and trust page covering moderation standards, verification checks, and reporting guidance."
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: siteUrl
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Security & Trust",
            item: `${siteUrl}/security`
          }
        ]
      }
    ]
  };

  return (
    <div className="mx-auto max-w-4xl space-y-20 px-6 py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(securitySchema) }} />

      <div className="space-y-6 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10 shadow-glow mb-4">
          <ShieldCheck className="h-10 w-10 text-cyan-400" />
        </div>
        <h1 className="font-display text-4xl font-bold text-white md:text-6xl">Security & Trust</h1>
        <p className="mx-auto max-w-2xl text-lg text-white/60 leading-relaxed">
          How we protect the community and ensure every resource on The Cloud Rain is safe, transparent, and high-quality.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {[
          {
            icon: <Search className="h-6 w-6 text-cyan-400" />,
            title: "Manual Review",
             desc: "Every submission is manually reviewed by a human moderator before it appears publicly."
          },
          {
            icon: <Lock className="h-6 w-6 text-purple-400" />,
            title: "Safe Links",
            desc: "We verify that download URLs point to trusted repositories or verified direct download mirrors."
          },
          {
            icon: <Eye className="h-6 w-6 text-emerald-400" />,
            title: "Zero Tracking",
            desc: "The platform does not inject tracking scripts into resources or harvest excessive user data."
          }
        ].map((item, i) => (
          <div key={i} className="glass-panel group rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-white/20">
            <div className="mb-4 inline-flex rounded-2xl bg-white/5 p-3 group-hover:bg-white/10 transition">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm leading-relaxed text-white/50">{item.desc}</p>
          </div>
        ))}
      </div>

      <section className="rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-8 md:p-12 space-y-10">
        <div className="space-y-4">
          <h2 className="font-display text-3xl font-bold text-white">Our Verification Standards</h2>
          <p className="text-white/60 leading-relaxed">
            When a tool is submitted to The Cloud Rain, it goes through a strict 4-step verification flow:
          </p>
        </div>

        <div className="space-y-6">
          {[
            {
              step: "01",
              title: "Source Verification",
              body: "We check the origin of the tool. If it's open source, we verify the GitHub repository activity and license clarity."
            },
            {
              step: "02",
              title: "Security Scan",
              body: "External download links are scanned via VirusTotal and Google Safe Browsing APIs to ensure they are free from malware."
            },
            {
              step: "03",
              title: "Quality Audit",
              body: "A moderator checks the documentation quality. We avoid tools that are broken, spammy, or require forced registrations."
            },
            {
              step: "04",
              title: "License Transparency",
              body: "We ensure the tool's license is clearly stated so you know exactly how you can use it in your projects."
            }
          ].map((item, i) => (
            <div key={i} className="flex gap-6">
              <span className="font-display text-3xl font-black text-white/10">{item.step}</span>
              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-bold text-white">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  {item.title}
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="h-16 w-16 flex-shrink-0 rounded-full bg-rose-500/20 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-rose-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white">Report a Concern</h3>
          <p className="text-sm text-white/60 leading-relaxed">
            Spotted a broken link or a suspicious resource? Your reports help keep the community safe. 
            Send a report to <span className="text-white font-medium">dineshwev.tcr@gmail.com</span> with the URL of the listing.
          </p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs uppercase tracking-[0.25em] text-white/45">Related pages</p>
        <h2 className="mt-2 text-xl text-white">Supporting trust pages</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/about" className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-semibold text-slate-900">
            About
          </Link>
          <Link href="/privacy" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Privacy Policy
          </Link>
          <Link href="/ads-disclosure" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Ads Disclosure
          </Link>
          <Link href="/contact" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}
