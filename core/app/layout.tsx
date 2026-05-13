import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthProvider";
import { getSiteUrl } from "@/lib/site-url";
import Script from "next/script";
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
    "Curated directory of 250+ open-source tools, self-hosted software, and practical SaaS alternatives for developers and DevOps teams.",
  keywords: [
    "free open source tools",
    "self-hosted alternatives",
    "SaaS replacements",
    "developer tools",
    "open source directory",
    "no-cost resources",
    "self-hosted tools directory",
    "developer workflow tools",
    "DevOps tools",
    "privacy focused tools",
    "The Cloud Rain"
  ],
  applicationName: siteName,
  category: "technology",
  alternates: {
    canonical: "https://www.thecloudrain.org"
  },
  openGraph: {
    type: "website",
    url: "https://www.thecloudrain.org",
    siteName,
    title: "The Cloud Rain | Open Source SaaS Alternatives",
    description:
      "Curated lightweight open-source tools, self-hosted software, and practical SaaS alternatives for developers and DevOps teams.",
    locale: "en_US",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "The Cloud Rain - Open Source Tools Directory"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Open Source SaaS Alternatives",
    description:
      "Curated open-source tools, self-hosted software, and lightweight SaaS alternatives for builders.",
    site: "@TheCloudRain_",
    images: [`${siteUrl}/og-image.png`]
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
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.svg`,
        width: 512,
        height: 512
      },
      description:
        "A curated directory of 250+ self-hosted open-source tools and lightweight alternatives to expensive SaaS platforms, built for developers and DevOps engineers.",
      sameAs: [
        "https://x.com/TheCloudRain_",
        "https://github.com/Dineshwev/hidden-open-source-tools",
        "https://dev.to/dinesh_regar"
      ],
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "Customer Support",
        url: `${siteUrl}/contact`
      }
    },
    {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description:
        "Self-hosted software directory and open-source tools curator — lightweight SaaS alternatives for developers and DevOps engineers.",
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/free-tools?search={search_term_string}`
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "No-Cost Resources", item: `${siteUrl}/free-tools` },
        { "@type": "ListItem", position: 3, name: "Tool Deep Dives", item: `${siteUrl}/article-museum` }
      ]
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {/* Google Search Console verification (paste the tag value and remove comment to verify):
            <meta name="google-site-verification" content="PASTE_CODE_HERE" />
        */}
        <Script defer data-domain="thecloudrain.site" src="https://plausible.io/js/script.js" strategy="afterInteractive" />
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
