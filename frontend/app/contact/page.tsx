import type { Metadata } from "next";
import ContactPageClient from "@/components/contact/ContactPageClient";

const siteUrl = "https://thecloudrain.site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach Dinesh with identified or anonymous messages. Private replies for identified messages and public community answers for anonymous queries.",
  alternates: {
    canonical: "/contact"
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Dinesh",
  url: siteUrl,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    url: `${siteUrl}/contact`
  },
  sameAs: ["https://github.com/Dineshwev", "https://twitter.com/YOUR_TWITTER"]
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ContactPageClient />
    </>
  );
}
