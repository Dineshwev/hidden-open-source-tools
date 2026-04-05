"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function AdScripts() {
  const pathname = usePathname() || "";
  const enableAds = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/control-room");

  if (!enableAds || isAdminRoute) {
    return null;
  }

  return (
    <>
      <Script id="monetag-popunder" strategy="afterInteractive">
        {"(function(s){s.dataset.zone='10833643',s.src='https://al5sm.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"}
      </Script>

      <Script
        id="monetag-push"
        src="https://5gvci.com/act/files/tag.min.js?z=10833644"
        data-cfasync="false"
        strategy="afterInteractive"
      />

      <Script id="monetag-inpage-push" strategy="afterInteractive">
        {"(function(s){s.dataset.zone='10833645',s.src='https://nap5k.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"}
      </Script>

      <Script id="monetag-vignette" strategy="afterInteractive">
        {"(function(s){s.dataset.zone='10833650',s.src='https://n6wxm.com/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))"}
      </Script>
    </>
  );
}