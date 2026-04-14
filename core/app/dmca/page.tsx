import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "DMCA Policy | The Cloud Rain",
  description:
    "Review The Cloud Rain DMCA notice and counter-notice process, infringement reporting requirements, and copyright dispute handling.",
  keywords: ["DMCA", "copyright takedown", "counter notice", "The Cloud Rain DMCA"],
  alternates: {
    canonical: "/dmca"
  },
  openGraph: {
    title: "DMCA Policy | The Cloud Rain",
    description:
      "How to submit a DMCA notice or counter-notice for content on The Cloud Rain.",
    url: `${siteUrl}/dmca`
  }
};

const dmcaSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "DMCA Policy | The Cloud Rain",
  url: `${siteUrl}/dmca`,
  description:
    "Review The Cloud Rain DMCA notice and counter-notice process, infringement reporting requirements, and copyright dispute handling.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  inLanguage: "en"
};

export default function DmcaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dmcaSchema) }} />

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">DMCA Notice</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Digital Millennium Copyright Act Procedure</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed text-lg">
          The Cloud Rain respects intellectual property rights. This page explains the DMCA process for reporting infringement and for responding if your content was removed by mistake.
        </p>
        <p className="max-w-3xl text-white/65 leading-relaxed text-sm">
          This DMCA policy outlines the required notice format, counter-notice requirements, and review standards used by The Cloud Rain. Clear, complete submissions help us resolve copyright disputes faster and more accurately.
        </p>
      </div>

      <div className="space-y-8 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">1. Filing a Takedown Notice</h2>
          <p className="text-sm leading-relaxed">
            If you believe your copyrighted work appears on the platform without permission, send a written takedown notice to our designated contact including all of the items below:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
            <li>A physical or electronic signature of a person authorized to act on behalf of the owner of the exclusive right that is allegedly infringed.</li>
            <li>Identification of the copyrighted work claimed to have been infringed upon.</li>
            <li>Identification of the material that is claimed to be infringing or to be the subject of infringing activity, along with exact URLs to help us locate the content.</li>
            <li>Sufficient contact information (address, telephone number, and email address) so we can communicate with you.</li>
            <li>A statement that the complaining party has a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">2. Filing a Counter-Notification</h2>
          <p className="text-sm leading-relaxed">
            If you believe your content was removed by mistake or misidentification, you may submit a counter-notice. To be effective, a Counter-Notification must be a written communication provided to our designated agent that includes:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
            <li>Your physical or electronic signature.</li>
            <li>Identification of the material that has been removed or to which access has been disabled, and the URL where the material previously appeared.</li>
            <li>A statement under penalty of perjury that you have a good-faith belief that the material was removed or disabled as a result of mistake or misidentification.</li>
            <li>Your name, address, and telephone number, and a statement that you consent to the jurisdiction of the federal district court.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">3. Repeat Infringer Policy</h2>
          <p className="text-sm leading-relaxed">
            In accordance with the DMCA and other applicable legal frameworks, The Cloud Rain maintains a strict repeat-infringer policy. Users whose accounts are found to repeatedly abuse our networks to distribute illicit or plagiarized material will have their accounts terminated without appeal or refund.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">4. Notice Review Timeline</h2>
          <p className="text-sm leading-relaxed">
            We review complete notices in the order received. Response time may vary based on volume and evidence quality, but complete claims with precise URLs, ownership proof, and contact details are prioritized.
          </p>
          <p className="text-sm leading-relaxed">
            During review, content may be temporarily limited, removed, or flagged pending verification.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">5. Misrepresentation and False Claims</h2>
          <p className="text-sm leading-relaxed">
            Submitting knowingly false or misleading infringement claims can result in legal consequences. Please ensure all statements are accurate and submitted in good faith.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">6. Evidence Tips for Faster Resolution</h2>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
            <li>Include exact URLs for each infringing page.</li>
            <li>Provide links to your original work and publication timestamps.</li>
            <li>Attach clear screenshots or archive references where relevant.</li>
            <li>State whether emergency removal is requested and why.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">7. Designated Agent Contact</h2>
          <p className="text-sm leading-relaxed">
            Please direct all official DMCA requests, complaints, and counter-notices exclusively to:
          </p>
          <a href="mailto:support@thecloudrain.site" className="mt-3 inline-block font-semibold text-cyan-300 hover:text-cyan-200 transition">
            support@thecloudrain.site
          </a>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Related legal pages</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/copyright" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Copyright Policy</Link>
            <Link href="/license" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">License Information</Link>
            <Link href="/terms" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Terms of Service</Link>
            <Link href="/privacy" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Privacy Policy</Link>
          </div>
        </section>
      </div>
    </div>
  );
}


