import { getSiteUrl } from "@/lib/site-url";
import { getApprovedSuccessToolCount } from "@/lib/tool-count";
import type { Metadata } from "next";
import HomeMobileLanding from "@/components/home/HomeMobileLanding";
import HomeDesktopLanding from "@/components/home/HomeDesktopLanding";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = getSiteUrl();
  const toolCount = await getApprovedSuccessToolCount();
  const title = "The Cloud Rain | Open Source Alternatives to SaaS";
  const description = `Browse ${toolCount}+ curated open-source tools, self-hosted software, and free alternatives to expensive SaaS. No accounts, no paywalls.`;

  return {
    title: { absolute: title },
    description,
    keywords: [
      "open source alternatives",
      "self-hosted software",
      "free developer tools",
      "SaaS alternatives",
      "open source directory",
      "self-hosted tools"
    ],
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "The Cloud Rain",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export default function HomePage() {
  return (
    <div>
      <div className="block lg:hidden">
        <HomeMobileLanding />
      </div>
      <div className="hidden lg:block">
        <HomeDesktopLanding />
      </div>
    </div>
  );
}