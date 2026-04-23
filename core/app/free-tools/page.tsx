import type { Metadata } from "next";
import FreeToolsPageClient from "./FreeToolsPageClient";
import { getFreeToolsPageData } from "./free-tools-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";
const pagePath = "/free-tools";
const pageTitle = "Free Developer Resources Directory | The Cloud Rain";
const pageDescription =
  "Browse free developer resources, UI kits, courses, templates, AI tools, and components curated for developers.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "free developer resources",
    "free ui kits",
    "free developer courses",
    "developer templates",
    "ai tools for developers",
    "The Cloud Rain"
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
        alt: "Free Developer Resources Directory"
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
