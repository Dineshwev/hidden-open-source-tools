import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthProvider";
import { getSiteUrl } from "@/lib/site-url";
import Script from 'next/script';
import { SpeedInsights } from "@vercel/speed-insights/next";

const siteName = "The Cloud Rain";
const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Cloud Rain | Free Open Source Tools & Hidden Gem Software",
    template: "%s | The Cloud Rain"
  },
  description:
    "The Cloud Rain is a curated directory of 250+ free open source tools, hidden gems, self-hosted software, and practical SaaS alternatives for developers, DevOps teams, and indie hackers. No paywalls, no vendor lock-in.",
  keywords: [
    "free open source tools",
    "free software",
    "hidden gems",
    "self-hosted software",
    "SaaS alternatives",
    "free developer tools",
    "DevOps tools free",
    "open source alternatives",
    "lightweight tools",
    "indie hacker tools",
    "open source software directory",
    "free UI kits and templates",
    "no cost developer resources",
    "The Cloud Rain"
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
    title: "The Cloud Rain | Open Source SaaS Alternatives",
    description:
      "Curated lightweight open-source tools, self-hosted software, and practical SaaS alternatives for developers and DevOps teams.",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Open Source SaaS Alternatives",
    description:
      "Curated open-source tools, self-hosted software, and lightweight SaaS alternatives for builders."
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
  "@graph": [
    {
      "@type": "Organization",
      "name": siteName,
      "url": siteUrl,
      "logo": `${siteUrl}/og/og-image.png`,
      "description": "A curated directory of 250+ free open source tools, hidden gems, self-hosted software, and practical SaaS alternatives for developers.",
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Support",
        "url": `${siteUrl}/contact`
      }
    },
    {
      "@type": "WebSite",
      "name": siteName,
      "url": siteUrl,
      "description": "Free open source tools directory, self-hosted software alternatives, and hidden gems for developers.",
      "inLanguage": "en",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `${siteUrl}/free-tools?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": siteUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "No-Cost Resources",
          "item": `${siteUrl}/free-tools`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Tool Deep Dives",
          "item": `${siteUrl}/article-museum`
        }
      ]
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google Search Console verification (paste the tag value and remove comment to verify):
            <meta name="google-site-verification" content="PASTE_CODE_HERE" />
        */}
        <Script
          defer
          data-domain="thecloudrain.site"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Navbar />
          <ScrollProgress />
          <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 pt-4">{children}</main>
          <Footer />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
