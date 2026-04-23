import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FreeToolsPageClient from "../../FreeToolsPageClient";
import { buildFreeToolsRoute, getCategoryPageBySlug, getFreeToolsPageData } from "../../free-tools-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

type PageProps = {
  params: {
    category: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categoryPage = getCategoryPageBySlug(params.category);
  if (!categoryPage) return {};

  return {
    title: `${categoryPage.title} | The Cloud Rain`,
    description: categoryPage.description,
    alternates: {
      canonical: buildFreeToolsRoute(categoryPage.slug, 1)
    },
    openGraph: {
      title: `${categoryPage.title} | The Cloud Rain`,
      description: categoryPage.description,
      url: `${siteUrl}${buildFreeToolsRoute(categoryPage.slug, 1)}`
    }
  };
}

export default async function FreeToolsCategoryPage({ params }: PageProps) {
  const categoryPage = getCategoryPageBySlug(params.category);
  if (!categoryPage) {
    notFound();
  }

  const { initialTools, initialCount, initialTotalPages, currentPage } = await getFreeToolsPageData({
    page: 1,
    category: categoryPage.category
  });

  return (
    <FreeToolsPageClient
      initialTools={initialTools}
      initialCount={initialCount}
      initialTotalPages={initialTotalPages}
      initialPage={currentPage}
      initialCategory={categoryPage.category}
    />
  );
}
