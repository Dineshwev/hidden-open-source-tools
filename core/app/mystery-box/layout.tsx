import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

const mysteryBoxStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Random Tool Finder",
  url: `${siteUrl}/mystery-box`,
  description:
    "Randomized discovery for open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  mainEntity: {
    "@type": "CreativeWork",
    name: "Randomized Developer Tool Discovery",
    audience: {
      "@type": "Audience",
      audienceType: "Developers and creators"
    },
    about: ["Open-source tools", "Developer resources", "Self-hosted software"]
  }
};

export const metadata: Metadata = {
  title: "Random Open Source Tool Discovery for Developer Teams",
  description:
    "Use randomized discovery to find open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives curated by The Cloud Rain.",
  keywords: [
    "random developer resources",
    "open source discovery",
    "lightweight SaaS alternatives"
  ],
  alternates: {
    canonical: "/mystery-box"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/mystery-box`,
    title: "Random Open Source Tool Discovery for Developer Teams",
    description:
      "Use randomized discovery to find open-source developer tools, self-hosted utilities, and lightweight SaaS alternatives."
  },
  twitter: {
    card: "summary_large_image",
    title: "Random Open Source Tool Discovery for Developer Teams",
    description: "Find curated random developer resources in a transparent, moderation-backed flow."
  }
};

export default function MysteryBoxLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(mysteryBoxStructuredData) }}
      />
      {children}
    </>
  );
}
