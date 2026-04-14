import type { Metadata } from "next";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Privacy Policy | The Cloud Rain",
  description:
    "Read how The Cloud Rain collects, uses, protects, and retains data across account access, moderation workflows, and resource discovery features.",
  keywords: ["privacy policy", "data handling", "GDPR", "CCPA", "The Cloud Rain privacy"],
  alternates: {
    canonical: "/privacy"
  },
  openGraph: {
    title: "Privacy Policy | The Cloud Rain",
    description:
      "Understand data collection, cookies, retention, security controls, and user privacy rights on The Cloud Rain.",
    url: `${siteUrl}/privacy`
  }
};

const privacySchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy | The Cloud Rain",
  url: `${siteUrl}/privacy`,
  description:
    "Read how The Cloud Rain collects, uses, protects, and retains data across account access, moderation workflows, and resource discovery features.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  inLanguage: "en"
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-10 px-6 py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }} />

      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/80">Privacy Policy</p>
        <h1 className="font-display text-4xl font-bold text-white md:text-5xl">Privacy and Data Handling</h1>
        <p className="max-w-3xl text-white/70 leading-relaxed text-lg">
          Last updated: {new Date().toLocaleDateString()}. This page explains what data we collect, why we collect it, how we use it, and what choices you have. We wrote it in plain language so you can understand how privacy works on The Cloud Rain.
        </p>
        <p className="max-w-3xl text-white/65 leading-relaxed text-sm">
          This Privacy Policy applies to core site features including account access, moderation workflows, contact messages, analytics, and resource discovery pages. It is designed to be readable for visitors while still meeting practical legal and compliance expectations.
        </p>
      </div>

      <div className="space-y-8 text-white/70 leading-relaxed">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">1. Information We Collect</h2>
          <p className="text-sm leading-relaxed">
            When you visit the site, we collect basic technical data such as IP address, browser type, device details, language, referral pages, and usage patterns. This helps us run the platform safely, improve performance, and understand what features are useful.
          </p>
          <p className="text-sm leading-relaxed">
            If you create an account to upload or moderate tools, we collect personal information that you voluntarily provide to us when registering. You may provide us with your name, email address, usernames, passwords, and other similar information.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">2. How We Use Your Information</h2>
          <p className="text-sm leading-relaxed">
            We use personal information collected via our website for a variety of business purposes, including:
          </p>
          <ul className="list-disc pl-5 mt-3 space-y-2 text-sm">
            <li><strong>To facilitate account creation and login processes:</strong> To manage user identities and protect the platform from unauthorized access.</li>
            <li><strong>To moderate and manage content:</strong> To ensure that the files uploaded via the Mystery Box and free tools directory meet our community and legal standards.</li>
            <li><strong>To operate and maintain our services:</strong> To analyze metrics, track platform health, and discover new trending developer tools.</li>
            <li><strong>For security and fraud prevention:</strong> We may use your information as part of our efforts to keep our website safe and secure.</li>
            <li><strong>To respond to legal requests and prevent harm:</strong> If we receive a subpoena or other legal request, we may need to inspect the data we hold to determine how to respond.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">3. Cookies and Tracking Technologies</h2>
          <p className="text-sm leading-relaxed">
            We may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. We use these technologies to analyze trends, administer the website, track users’ movements around the site, and gather demographic information about our user base as a whole. You may choose to disable cookies through your individual browser settings, but doing so may affect your ability to use certain features or functions of our services.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">4. Third-Party Services</h2>
          <p className="text-sm leading-relaxed">
            We use trusted providers for hosting, storage, analytics, and support workflows (for example Supabase and Netlify). We share only the data needed for those services to work.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">5. Legal Bases for Processing</h2>
          <p className="text-sm leading-relaxed">
            Where required by law, we process personal data under one or more legal bases: your consent, performance of a contract, compliance with legal obligations, and our legitimate interests in operating, securing, and improving the platform.
          </p>
          <p className="text-sm leading-relaxed">
            Legitimate interests include detecting abuse, preventing fraud, maintaining platform reliability, and improving discovery quality. When we rely on this basis, we balance those interests against your rights and expectations.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">6. Your Privacy Rights (GDPR / CCPA)</h2>
          <p className="text-sm leading-relaxed">
            Depending on where you live, you may have rights to access, correct, delete, restrict, or transfer your personal data. You may also be able to object to certain processing activities.
          </p>
          <p className="text-sm leading-relaxed">
            If you are a resident of the European Economic Area (EEA), you have the right to complain to your local data protection supervisory authority. If you are a California resident, you have rights shaped by the CCPA, including the right to know what personal data is being collected and the right to have that data deleted.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">7. Data Retention</h2>
          <p className="text-sm leading-relaxed">
            We retain personal information only as long as needed for the purposes described in this policy, including platform operation, moderation records, legal compliance, dispute resolution, and enforcement of agreements.
          </p>
          <p className="text-sm leading-relaxed">
            Retention periods vary by data type. For example, technical logs may be kept for security and debugging windows, while moderation and legal records may be retained longer when required by law or to resolve claims.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">8. International Data Transfers</h2>
          <p className="text-sm leading-relaxed">
            Some providers may process data in different countries. Where required, we apply safeguards such as contractual protections and security controls.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">9. Security Measures</h2>
          <p className="text-sm leading-relaxed">
            We use access controls, environment-based secrets, and monitoring to protect data. No system is perfect, but we continuously improve security to lower risk.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">10. Children&apos;s Privacy</h2>
          <p className="text-sm leading-relaxed">
            Our services are not directed to children under the age required by local law to consent to data processing. If you believe a child has provided personal data without proper authorization, contact us and we will review and remove the information when appropriate.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">11. Policy Updates</h2>
          <p className="text-sm leading-relaxed">
            We may update this policy to reflect legal, technical, or operational changes. Material updates will be published on this page with a revised "Last updated" date.
          </p>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 space-y-4">
          <h2 className="font-display text-2xl font-semibold text-white">12. Contact Us</h2>
          <p className="text-sm leading-relaxed">
            If you have questions or comments about this privacy policy, or if you wish to exercise your data protection rights, you can contact our Data Protection Officer at:
          </p>
          <a href="mailto:support@thecloudrain.site" className="mt-3 inline-block font-semibold text-cyan-300 hover:text-cyan-200 transition">
            support@thecloudrain.site
          </a>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">Related legal pages</p>
          <p className="mt-2 text-sm text-white/65">See the policies connected to privacy, user rights, and platform responsibilities.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/terms" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white/90">Terms of Service</Link>
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


