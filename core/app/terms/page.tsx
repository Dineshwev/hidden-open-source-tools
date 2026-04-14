import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Terms of Service | The Cloud Rain",
  description:
    "Review The Cloud Rain Terms of Service for platform use, uploads, moderation standards, liability limits, and account responsibilities.",
  keywords: ["terms of service", "platform terms", "acceptable use", "The Cloud Rain terms"],
  alternates: {
    canonical: "/terms"
  },
  openGraph: {
    title: "Terms of Service | The Cloud Rain",
    description:
      "Platform rules for browsing, submissions, moderation, and acceptable use on The Cloud Rain.",
    url: `${siteUrl}/terms`
  }
};

const termsSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Terms of Service | The Cloud Rain",
  url: `${siteUrl}/terms`,
  description:
    "Review The Cloud Rain Terms of Service for platform use, uploads, moderation standards, liability limits, and account responsibilities.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  inLanguage: "en"
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }} />

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Terms of Service</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Platform Usage Terms</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed text-lg">
          Last updated: {new Date().toLocaleDateString()}. These Terms explain the rules for using The Cloud Rain, including browsing resources, downloading tools, and submitting content. By using the platform, you agree to these terms.
        </p>
        <p className="max-w-3xl text-white/65 leading-relaxed text-sm">
          These Terms of Service cover user conduct, acceptable use, uploads, moderation actions, external links, and legal limitations. They are written to be clear for everyday users while setting enforceable standards for platform safety and content quality.
        </p>
      </div>

      <div className="space-y-8 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">1. Agreement to Terms</h2>
          <p className="text-sm leading-relaxed">
            By using The Cloud Rain ("the platform", "we", "us", or "our"), you agree to these Terms. If you do not agree, do not use the platform. We may update these Terms from time to time and will update the date on this page.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">2. Acceptable Use and Restrictions</h2>
          <p className="text-sm leading-relaxed">
            To keep the platform safe and usable for everyone, you agree not to:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
            <li>Employ automated bots, scripts, or scrapers to extract data, download software, or bypass the Mystery Box constraints.</li>
            <li>Reverse-engineer, decompile, or attempt to compromise the security APIs running the platform.</li>
            <li>Submit malicious, misleading, or heavily obfuscated code to the platform masquerading as legitimate open-source resources.</li>
            <li>Upload copyrighted material without explicit permission from the original rights holder.</li>
            <li>Intentionally spam the moderation queue or abuse the reporting systems.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">3. User Uploads and Content Ownership</h2>
          <p className="text-sm leading-relaxed">
            When you upload or share open-source tools or templates to The Cloud Rain, you retain all ownership rights to your original content. However, by submitting content to our platform, you grant us a worldwide, non-exclusive, royalty-free license to distribute, display, review, and organize that content as part of our free tools directory. 
          </p>
          <p className="text-sm leading-relaxed">
            You represent and warrant that your uploads: (a) do not infringe upon any intellectual property rights; (b) do not contain viruses, trojans, or malware; and (c) are correctly categorized as free and open-source resources.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">4. Disclaimers and Limitations of Liability</h2>
          <p className="text-sm leading-relaxed">
            THE CLOUD RAIN IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. We cannot guarantee that every third-party upload is safe, accurate, or suitable for your use case. Please review and test resources before using them in production.
          </p>
          <p className="text-sm leading-relaxed">
            To the extent allowed by law, The Cloud Rain and its operators are not liable for indirect or consequential damages arising from your use of the platform or listed resources.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">5. Platform Adjustments and Moderation</h2>
          <p className="text-sm leading-relaxed">
            We may limit access, suspend accounts, or remove uploads if we detect abuse, security risks, or policy violations. We may also remove listings to protect platform quality and legal compliance.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">6. Eligibility and Account Responsibility</h2>
          <p className="text-sm leading-relaxed">
            You must use accurate account details and keep credentials secure. You are responsible for activity occurring under your account, including uploads, moderation actions, and API interactions performed with your credentials.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">7. External Links and Third-Party Content</h2>
          <p className="text-sm leading-relaxed">
            The platform may link to third-party websites, repositories, and hosted files. We do not control third-party terms, privacy practices, or code safety. You should review those terms directly before downloading or executing any external resource.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">8. Indemnification</h2>
          <p className="text-sm leading-relaxed">
            You agree to indemnify and hold harmless The Cloud Rain and its operators from claims, liabilities, damages, and expenses arising from your misuse of the service, your content uploads, or your violation of these Terms.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">9. Termination</h2>
          <p className="text-sm leading-relaxed">
            We may suspend or terminate access immediately where required for security, legal compliance, abuse prevention, or operational integrity. You may stop using the service at any time.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">10. Governing Law and Disputes</h2>
          <p className="text-sm leading-relaxed">
            These Terms are interpreted under applicable governing law based on our operating jurisdiction, unless mandatory local consumer laws provide otherwise. Disputes should first be raised through support so we can attempt a practical resolution.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">11. Contact</h2>
          <p className="text-sm leading-relaxed">
            For legal and terms questions, contact support and include relevant URLs, timestamps, and details so our team can review quickly.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Related legal pages</p>
          <p className="mt-2 text-sm text-white/65">Explore connected policies for privacy, ownership, and compliance workflows.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/privacy" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Privacy Policy</Link>
            <Link href="/copyright" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Copyright Policy</Link>
            <Link href="/dmca" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">DMCA Policy</Link>
            <Link href="/license" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">License Information</Link>
            <Link href="/ads-disclosure" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Ads Disclosure</Link>
          </div>
        </section>
      </div>
    </div>
  );
}


