export function buildToolStructuredData(
  tool: {
    name: string;
    slug: string;
    category?: string;
    description?: string;
    url?: string;
    stars?: number | null;
    license?: string | null;
  },
  siteUrl: string,
  faviconUrl?: string
) {
  const pageUrl = `${siteUrl.replace(/\/$/, "")}/tools/${tool.slug}`;
  const cleanedDescription = (tool.description || "").replace(/\s+/g, " ").trim();
  const starsCount = tool.stars && tool.stars > 0 ? tool.stars : null;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        name: `${tool.name} – Open Source Alternative`,
        url: pageUrl,
        description: cleanedDescription,
        isPartOf: {
          "@type": "WebSite",
          "@id": `${siteUrl}/#website`,
          name: "The Cloud Rain",
          url: siteUrl,
        },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Explore Tools", item: `${siteUrl.replace(/\/$/, "")}/free-tools` },
          { "@type": "ListItem", position: 3, name: tool.name, item: pageUrl },
        ],
      },
      {
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: tool.category || "DeveloperApplication",
        operatingSystem: "Cross-Platform",
        description: cleanedDescription,
        url: tool.url || pageUrl,
        image: faviconUrl || undefined,
        license: tool.license ? `https://spdx.org/licenses/${tool.license}` : undefined,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free and Open Source",
        },
        ...(starsCount && starsCount >= 5
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: starsCount > 1000 ? "4.9" : "4.8",
                bestRating: "5",
                worstRating: "1",
                ratingCount: starsCount,
              },
            }
          : {}),
        publisher: {
          "@type": "Organization",
          name:
            (tool.url &&
              (() => {
                try {
                  return new URL(tool.url).hostname.replace(/^www\./, "");
                } catch {
                  return "Open Source Maintainers";
                }
              })()) ||
            "Open Source Maintainers",
        },
      },
    ],
  };
}

export default buildToolStructuredData;
