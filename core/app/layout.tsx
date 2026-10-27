import type { Metadata } from "next";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthProvider";
import { getSiteUrl } from "@/lib/site-url";
import { getApprovedSuccessToolCount } from "@/lib/tool-count";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";

const siteName = "The Cloud Rain";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const toolCount = await getApprovedSuccessToolCount();
  const description = `Browse ${toolCount}+ curated open-source tools and developer resources. Discover self-hosted software, SaaS alternatives, GitHub stars, and source code links.`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: "The Cloud Rain | Curated Open-Source Tools & SaaS Alternatives",
      template: "%s | The Cloud Rain"
    },
    description,
    applicationName: siteName,
    category: "technology",
    alternates: {
      canonical: siteUrl
    },
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName,
      title: "The Cloud Rain | Curated Open-Source Tools & SaaS Alternatives",
      description,
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
      title: "The Cloud Rain | Curated Open-Source Tools & SaaS Alternatives",
      description,
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
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteUrl = getSiteUrl();
  const toolCount = await getApprovedSuccessToolCount();

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
          `A curated directory of ${toolCount}+ open-source tools and developer resources, with project details and source links.`,
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
          "A directory of open-source tools and developer resources, with comparisons and practical project guides.",
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
          { "@type": "ListItem", position: 2, name: "Explore Tools", item: `${siteUrl}/free-tools` },
          { "@type": "ListItem", position: 3, name: "Articles", item: `${siteUrl}/article-museum` }
        ]
      }
    ]
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Script defer data-domain="thecloudrain.org" src="https://plausible.io/js/script.js" strategy="afterInteractive" />
      </head>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Navbar />
          <ScrollProgress />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 py-8 pt-4">{children}</main>
          <Footer />
          <SpeedInsights />
        </AuthProvider>
      </body>
    </html>
  );
}
