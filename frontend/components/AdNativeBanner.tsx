"use client";

import Script from "next/script";
import { getAdsterraNativeBannerScriptUrl } from "@/lib/adsterra";

export default function AdNativeBanner() {
  const scriptSrc = getAdsterraNativeBannerScriptUrl();
  const containerMatch = scriptSrc.match(/\/([^/]+)\/invoke\.js$/i);
  const containerId = containerMatch?.[1] ?? "";

  if (!scriptSrc || !containerId) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-[300px] flex-col items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.28em] text-white/35">Advertisement</span>
      <Script id="adsterra-native-banner" strategy="afterInteractive" src={scriptSrc} />
      <div id={`container-${containerId}`} className="min-h-[250px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20" />
    </div>
  );
}
