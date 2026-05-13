import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

const freeToolsStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "No-Cost Developer Resources",
  url: `${siteUrl}/free-tools`,
  description:
    "Curated no-cost developer resources, open-source tools, UI kits, templates, courses, and components for engineering teams.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  about: [
    "No-cost developer tools",
    "Open source resources",
    "UI kits",
    "Templates",
    "Developer courses"
  ]
};

export const metadata: Metadata = {
  title: "No-Cost Developer Resources and Open Source Tools",
  description:
    "Browse 250+ no-cost developer resources — open-source tools, UI kits, templates, courses, and components curated for practical engineering work.",
  keywords: [
    "no-cost developer tools",
    "open source tools",
    "UI kits",
    "templates",
    "developer courses",
    "open source directory"
  ],
  alternates: {
    canonical: "/free-tools"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/free-tools`,
    title: "No-Cost Developer Resources and Open Source Tools",
    description:
      "Browse 250+ no-cost developer resources — open-source tools, UI kits, templates, courses, and components curated for practical engineering work."
  },
  twitter: {
    card: "summary_large_image",
    title: "No-Cost Developer Resources and Open Source Tools",
    description: "Curated no-cost tools, templates, courses, and components for developers."
  }
};

export default function FreeToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(freeToolsStructuredData) }}
      />
      {children}
    </>
  );
}
