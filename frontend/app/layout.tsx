import type { Metadata } from "next";
import Script from "next/script";
import "@/styles/globals.css";
import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "The Cloud Rain - Mystery Download Box",
  description:
    "An open-source platform for unlocking random digital downloads, contributing resources, and moderating a creator-powered mystery economy."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Monetag Onclick (Popunder) */}
        <Script
          id="monetag-popunder"
          strategy="afterInteractive"
        >
          {"(function(s){s.dataset.zone='10833643',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"}
        </Script>

        {/* Monetag Push Notifications */}
        <Script
          id="monetag-push"
          src="https://5gvci.com/act/files/tag.min.js?z=10833644"
          data-cfasync="false"
          strategy="afterInteractive"
        />

        {/* Monetag In-Page Push (visible) */}
        <Script
          id="monetag-inpage-push"
          strategy="afterInteractive"
        >
          {"(function(s){s.dataset.zone='10833645',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"}
        </Script>

        {/* Monetag Vignette banner (visible overlay) */}
        <Script
          id="monetag-vignette"
          strategy="afterInteractive"
        >
          {"(function(s){s.dataset.zone='10833650',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"}
        </Script>
      </head>
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <ScrollProgress />
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 pt-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
