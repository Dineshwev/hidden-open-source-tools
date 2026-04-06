"use client";

import { useEffect, useRef, useState } from "react";
import { getAdsterraNativeBannerScriptUrl } from "@/lib/adsterra";

export default function AdNativeBanner() {
  const scriptSrc = getAdsterraNativeBannerScriptUrl();
  const containerMatch = scriptSrc.match(/\/([^/]+)\/invoke\.js$/i);
  const containerId = containerMatch?.[1] ?? "";
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!scriptSrc || !containerId) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    setFailed(false);
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = scriptSrc;
    script.async = true;

    script.onerror = () => {
      setFailed(true);
    };

    container.appendChild(script);

    const renderCheck = window.setTimeout(() => {
      if (!container.querySelector("iframe") && !container.querySelector("img")) {
        setFailed(true);
      }
    }, 10000);

    return () => {
      window.clearTimeout(renderCheck);
      container.innerHTML = "";
    };
  }, [containerId, scriptSrc]);

  if (!scriptSrc || !containerId) {
    return null;
  }

  return (
    <div className="mx-auto flex w-full max-w-[300px] flex-col items-center gap-2">
      <span className="text-[10px] uppercase tracking-[0.28em] text-white/35">Advertisement</span>
      <div
        ref={containerRef}
        id={`container-${containerId}`}
        className="min-h-[250px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20"
      />
      {failed && (
        <p className="text-xs text-white/40">Native ad unit did not render. Check publisher approval or browser blocking.</p>
      )}
    </div>
  );
}
