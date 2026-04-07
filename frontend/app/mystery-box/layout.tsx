import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

const mysteryBoxStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Mystery Box Downloads",
  url: `${siteUrl}/mystery-box`,
  description:
    "Unlock randomized developer resources through a moderated mystery-box flow with transparent sponsor steps.",
  isPartOf: {
    "@type": "WebSite",
    name: "The Cloud Rain",
    url: siteUrl
  },
  mainEntity: {
    "@type": "CreativeWork",
    name: "Mystery Unlock Experience",
    audience: {
      "@type": "Audience",
      audienceType: "Developers and creators"
    },
    about: ["Open source downloads", "Developer resources", "Rewarded unlock flow"]
  }
};

export const metadata: Metadata = {
  title: "Mystery Box Downloads",
  description:
    "Unlock randomized developer resources through a moderated mystery-box flow with transparent sponsor steps.",
  keywords: [
    "mystery box downloads",
    "random developer resources",
    "rewarded unlock flow",
    "open source downloads",
    "developer mystery box"
  ],
  alternates: {
    canonical: "/mystery-box"
  },
  openGraph: {
    type: "website",
    url: `${siteUrl}/mystery-box`,
    title: "Mystery Box Downloads | The Cloud Rain",
    description:
      "Experience a premium mystery unlock flow for curated digital resources with moderation-backed quality control."
  },
  twitter: {
    card: "summary_large_image",
    title: "Mystery Box Downloads | The Cloud Rain",
    description: "Unlock curated random digital resources in a transparent, moderation-backed flow."
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