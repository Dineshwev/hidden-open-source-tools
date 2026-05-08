import type { Metadata } from "next";
import FreeToolsPageClient from "./FreeToolsPageClient";
import { getFreeToolsPageData } from "./free-tools-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";
const pagePath = "/free-tools";
const pageTitle = "No-Cost Developer Resources and Open Source Tools";
const pageDescription =
  "Browse no-cost developer resources, open-source tools, UI kits, courses, templates, and components curated for practical engineering work.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "no-cost developer tools",
    "open-source resources",
    "developer templates"
  ],
  alternates: {
    canonical: pagePath
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${siteUrl}${pagePath}`,
    images: [
      {
        url: `${siteUrl}/og/free-tools.png`,
        width: 1200,
        height: 630,
        alt: "No-Cost Developer Resources Directory"
      }
    ]
  }
};

export default async function FreeToolsPage() {
  const { initialTools, initialCount, initialTotalPages, currentPage } = await getFreeToolsPageData({ page: 1 });

  return (
    <FreeToolsPageClient
      initialTools={initialTools}
      initialCount={initialCount}
      initialTotalPages={initialTotalPages}
      initialPage={currentPage}
    />
  );
}
