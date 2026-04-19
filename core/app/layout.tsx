import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthProvider";
import Script from 'next/script';

const siteName = "The Cloud Rain";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Cloud Rain | Premium Developer Resources & Mystery Box Drops",
    template: "%s | The Cloud Rain"
  },
  description:
    "The Cloud Rain is the ultimate hub for premium developer resources. Access curated UI kits, source codes, AI tools, and exclusive templates for free through our interactive mystery box experience.",
  keywords: [
    "premium developer resources",
    "free UI kits",
    "source code downloads",
    "mystery box developer tools",
    "web development templates",
    "free SaaS templates",
    "coding assets",
    "digital designer resources",
    "open source software library",
    "frontend developer tools"
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
    title: "The Cloud Rain | Premium Developer Resources & Mystery Box Drops",
    description:
      "Unlock curated, high-quality developer assets for free. Join The Cloud Rain community and discover exclusive UI kits, templates, and tools.",
    locale: "en_US"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Premium Developer Resources",
    description:
      "The ultimate destination for developers. Unlock premium UI kits, source codes, and templates through our daily mystery box."
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
      "description": "Open-source platform for free developer resources, curated tools, and mystery-box style unlock experiences.",
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
          "name": "Free Tools",
          "item": `${siteUrl}/free-tools`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Article Museum",
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
        </AuthProvider>
      </body>
    </html>
  );
}
