export function buildToolStructuredData(tool: {
  name: string;
  slug: string;
  category?: string;
  description?: string;
  url?: string;
}, siteUrl: string, faviconUrl?: string) {
  const pageUrl = `${siteUrl.replace(/\/$/, "")}/tools/${tool.slug}`;
  const cleanedDescription = (tool.description || "").replace(/\s+/g, " ").trim();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: tool.name,
        url: pageUrl,
        description: cleanedDescription,
        isPartOf: {
          "@type": "WebSite",
          name: "The Cloud Rain",
          url: siteUrl
        },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` }
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Tools", item: `${siteUrl.replace(/\/$/, "")}/tools` },
          { "@type": "ListItem", position: 3, name: tool.name, item: pageUrl }
        ]
      },
      {
        "@type": "SoftwareApplication",
        name: tool.name,
        applicationCategory: tool.category || "Developer Resource",
        operatingSystem: "Web",
        description: cleanedDescription,
        url: tool.url || pageUrl,
        image: faviconUrl || undefined,
        publisher: {
          "@type": "Organization",
          name: (tool.url && (() => {
            try { return new URL(tool.url).hostname.replace(/^www\./, ""); } catch { return "External publisher"; }
          })()) || "External publisher"
        }
      }
    ]
  };
}

export default buildToolStructuredData;
