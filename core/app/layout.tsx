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
    default: "The Cloud Rain | Open Source SaaS Alternatives",
    template: "%s | The Cloud Rain"
  },
  description:
    "The Cloud Rain curates lightweight open-source tools, self-hosted software, and practical SaaS alternatives for developers, DevOps teams, and indie hackers.",
  keywords: [
    "open source SaaS alternatives",
    "self-hosted software",
    "lightweight developer tools",
    "DevOps tools",
    "indie hacker tools",
    "open source software library"
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
      "@type": "WebSite",
      "name": siteName,
      "url": siteUrl,
      "description": "Open-source platform for self-hosted software, lightweight developer tools, and SaaS alternatives.",
      "inLanguage": "en"
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
