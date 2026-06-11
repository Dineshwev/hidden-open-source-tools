import type { Metadata } from "next";
import HomeMobileLanding from "@/components/home/HomeMobileLanding";
import HomeDesktopLanding from "@/components/home/HomeDesktopLanding";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.org";

export const metadata: Metadata = {
  title: "The Cloud Rain | Open Source Alternatives to SaaS",
  description:
    "Browse 357+ curated open-source tools, self-hosted software, and free alternatives to expensive SaaS. No accounts, no paywalls.",
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
    title: "The Cloud Rain | Open Source Alternatives to SaaS",
    description: "Browse 357+ curated open-source tools and free SaaS alternatives for developers.",
    url: siteUrl,
    siteName: "The Cloud Rain",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Rain | Open Source Alternatives to SaaS",
    description: "Browse 357+ curated open-source tools and free SaaS alternatives for developers."
  }
};

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