import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FreeToolsPageClient from "../../FreeToolsPageClient";
import { buildFreeToolsRoute, getFreeToolsPageData } from "../../free-tools-data";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

type PageProps = {
  params: {
    page: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = Number(params.page);

  if (!Number.isFinite(page) || page < 2) {
    return {};
  }

  const title = `Free Developer Resources - Page ${page} | The Cloud Rain`;
  const description = `Browse page ${page} of the The Cloud Rain free developer resources directory, including tools, templates, courses, and open source resources.`;

  return {
    title,
    description,
    alternates: {
      canonical: buildFreeToolsRoute(null, page)
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}${buildFreeToolsRoute(null, page)}`
    }
  };
}

export default async function FreeToolsPaginationPage({ params }: PageProps) {
  const page = Number(params.page);

  if (!Number.isFinite(page) || page < 2) {
    notFound();
  }

  const { initialTools, initialCount, initialTotalPages, currentPage } = await getFreeToolsPageData({ page });

  if (currentPage > initialTotalPages) {
    notFound();
  }

  return (
    <FreeToolsPageClient
      initialTools={initialTools}
      initialCount={initialCount}
      initialTotalPages={initialTotalPages}
      initialPage={currentPage}
    />
  );
}
