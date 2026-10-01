import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

const siteUrl = getSiteUrl();

const freeToolsStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "No-Cost Developer Resources",
  url: `${siteUrl}/free-tools`,
  description:
    "Curated no-cost developer resources, open-source tools, self-hosted utilities, and practical components for engineering teams.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  about: [
    "No-cost developer tools",
    "Open source resources",
    "Self-hosted software",
    "Developer utilities",
    "Engineering workflows"
  ]
};

import { getApprovedSuccessToolCount } from "@/lib/tool-count";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const toolCount = await getApprovedSuccessToolCount();
  const description = `Browse ${toolCount}+ no-cost developer resources — open-source tools, self-hosted utilities, and developer components curated for practical engineering work.`;

  return {
    title: "No-Cost Developer Resources and Open Source Tools",
    description,
    keywords: [
      "no-cost developer tools",
      "open source tools",
      "self-hosted software",
      "developer utilities",
      "engineering workflows",
      "open source directory"
    ],
    alternates: {
      canonical: "/free-tools"
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}/free-tools`,
      title: "No-Cost Developer Resources and Open Source Tools",
      description
    },
    twitter: {
      card: "summary_large_image",
      title: "No-Cost Developer Resources and Open Source Tools",
      description
    }
  };
}

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
