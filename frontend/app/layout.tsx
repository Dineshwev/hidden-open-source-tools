import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";
import AdsterraScripts from "@/components/AdsterraScripts";

const siteName = "The Cloud Rain";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Cloud Rain | Free Tools, Mystery Box, Open Source Downloads",
    template: "%s | The Cloud Rain"
  },
  description:
    "Discover free developer tools, templates, UI kits, and curated resources. The Cloud Rain is an open-source platform with moderation-backed downloads and a mystery box unlock flow.",
  keywords: [
    "free developer tools",
    "open source tools",
    "free UI kits",
    "developer resources",
    "free templates",
    "coding tools",
    "mystery box downloads",
    "curated developer assets",
    "web development resources",
    "frontend tools"
  ],
  applicationName: siteName,
  category: "technology",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: "The Cloud Rain | Free Tools, Mystery Box, Open Source Downloads",
    description:
      "Find moderated, free developer resources including templates, courses, AI tools, and components.",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Free Tools and Open Source Downloads",
    description:
      "Explore curated free tools and unlock mystery rewards on an open-source, moderation-backed platform."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  description:
    "Open-source platform for free developer resources, curated tools, and mystery-box style unlock experiences.",
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/free-tools`,
    "query-input": "required name=search_term_string"
  },
  publisher: {
    "@type": "Organization",
    name: siteName,
    url: siteUrl
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <AdsterraScripts />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <ScrollProgress />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 pt-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
