import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

const freeToolsStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Developer Resources",
  url: `${siteUrl}/free-tools`,
  description:
    "Curated free tools, UI kits, templates, courses, AI tools, and components for developers.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  about: [
    "Free developer tools",
    "Open source resources",
    "UI kits",
    "Templates",
    "Developer courses"
  ]
};

export const metadata: Metadata = {
  title: "Free Developer Resources",
  description:
    "Browse curated free tools, UI kits, templates, courses, AI tools, and components for developers.",
  keywords: [
    "free developer resources",
    "free UI kits",
    "free templates",
    "free coding courses",
    "AI tools for developers",
    "frontend components"
  ],
  alternates: {
    canonical: "/free-tools"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/free-tools`,
    title: "Free Developer Resources | The Cloud Rain",
    description:
      "Discover hand-picked free developer tools and open source resources updated through a moderated pipeline."
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Developer Resources | The Cloud Rain",
    description: "Curated free tools, templates, courses, and components for developers."
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