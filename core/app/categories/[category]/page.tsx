import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getAdmin } from "@/lib/backend_lib/supabase-server";
import { dedupeToolRowsBySlug } from "@/lib/tool-records";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  CATEGORIES_DATA,
  getAllCategorySlugs,
  getCategoryMeta,
} from "@/lib/categories";
import CategoryPageClient from "./CategoryPageClient";

export const revalidate = 3600;

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export async function generateStaticParams() {
  return getAllCategorySlugs().map((slug) => ({
    category: slug,
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const meta = getCategoryMeta(params.category);
  if (!meta) return {};

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/categories/${meta.slug}`;
  const title = `Best Open-Source ${meta.label} (Free & Self-Hosted Directory)`;
  const description = `${meta.description} Browse production-ready open-source alternatives with Docker compose templates and $0 monthly subscriptions.`;

  return {
    title: { absolute: `${title} | The Cloud Rain` },
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${meta.label} – Open Source Tools Directory`,
      description,
      url: canonicalUrl,
      siteName: "The Cloud Rain",
      type: "website",
      images: [
        {
          url: `${siteUrl}/api/og?title=${encodeURIComponent(`Best Open-Source ${meta.label}`)}&category=${encodeURIComponent(meta.label)}`,
          width: 1200,
          height: 630,
          alt: `Open-Source ${meta.label}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.label} – Open Source Tools Directory`,
      description,
      images: [
        `${siteUrl}/api/og?title=${encodeURIComponent(`Best Open-Source ${meta.label}`)}&category=${encodeURIComponent(meta.label)}`,
      ],
    },
  };
}

function toolMatchesCategory(
  rawCat: string,
  haystack: string,
  categoryMeta: any
): boolean {
  const labelLower = categoryMeta.label.toLowerCase();
  const rawLower = rawCat.toLowerCase();

  if (rawLower && (rawLower.includes(labelLower) || labelLower.includes(rawLower))) {
    return true;
  }

  const hayLower = haystack.toLowerCase();
  return categoryMeta.keywords.some((kw: string) => hayLower.includes(kw));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const categoryMeta = getCategoryMeta(params.category);
  if (!categoryMeta) {
    notFound();
  }

  const siteUrl = getSiteUrl().replace(/\/$/, "");
  const supabase = getAdmin();

  let allApprovedTools: any[] = [];
  try {
    const { data } = await supabase
      .from("open_source_tools")
      .select("id, name, slug, description, category, url, logo_url, github_stars")
      .or("status.eq.approved,status.eq.APPROVED")
      .order("github_stars", { ascending: false, nullsFirst: false });
    if (data) allApprovedTools = dedupeToolRowsBySlug(data);
  } catch {}

  // Filter tools for this category
  const matchingTools = allApprovedTools.filter((t) => {
    const cat = String(t.category || "");
    const haystack = `${String(t.name || "")} ${String(t.description || "")} ${cat} ${String(t.url || "")}`;
    return toolMatchesCategory(cat, haystack, categoryMeta);
  });

  const tools = matchingTools.map((t) => ({
    id: String(t.id || ""),
    name: String(t.name || ""),
    slug: String(t.slug || ""),
    description: String(t.description || ""),
    category: String(t.category || categoryMeta.label),
    url: String(t.url || ""),
    logo_url: t.logo_url ? String(t.logo_url) : null,
    github_stars: typeof t.github_stars === "number" ? t.github_stars : null,
  }));

  const allCategoriesNav = getAllCategorySlugs().map((slug) => {
    const m = CATEGORIES_DATA[slug];
    return {
      slug: m.slug,
      label: m.label,
      icon: m.icon,
    };
  });

  // Structured Data
  const breadcrumbListSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Explore Tools",
        item: `${siteUrl}/free-tools`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryMeta.label,
        item: `${siteUrl}/categories/${categoryMeta.slug}`,
      },
    ],
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Best Open-Source ${categoryMeta.label}`,
    description: categoryMeta.description,
    numberOfItems: tools.length,
    itemListElement: tools.slice(0, 30).map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${siteUrl}/tools/${tool.slug}`,
    })),
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categoryMeta.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Explore Tools", href: "/free-tools" },
          { label: categoryMeta.label },
        ]}
      />

      <CategoryPageClient
        category={categoryMeta}
        tools={tools}
        allCategories={allCategoriesNav}
      />
    </div>
  );
}
