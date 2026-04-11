import type { Metadata } from "next";
import FreeToolsPageClient from "./FreeToolsPageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";
const pagePath = "/free-tools";
const pageTitle = "153+ Free Developer Resources | The Cloud Rain";
const pageDescription =
  "Free UI kits, courses, templates, AI tools curated for developers. Updated daily.";

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
        alt: "153+ Free Developer Resources"
      }
    ]
  }
};

export default function FreeToolsPage() {
  return <FreeToolsPageClient />;
}