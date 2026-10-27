import { getSiteUrl } from "@/lib/site-url";
import type { Metadata } from "next";

const siteUrl = getSiteUrl();

const freeToolsStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Open-Source Developer Tools Directory",
  url: `${siteUrl}/free-tools`,
  description:
    "A directory of open-source developer tools and software projects, with project details and source links where available.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  about: [
    "Open-source developer tools",
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
  const description = `Browse ${toolCount}+ open-source developer tools and software projects. Review descriptions, source links, licenses, and deployment details where available.`;

  return {
    title: "Open-Source Developer Tools Directory",
    description,
    alternates: {
      canonical: "/free-tools"
    },
    openGraph: {
      type: "website",
      url: `${siteUrl}/free-tools`,
      title: "Open-Source Developer Tools Directory",
      description
    },
    twitter: {
      card: "summary_large_image",
      title: "Open-Source Developer Tools Directory",
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
