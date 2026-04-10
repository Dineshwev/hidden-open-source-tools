"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __monetagVignetteLoaded?: boolean;
  }
}

const SCRIPT_ID = "monetag-vignette-script";
const VIGNETTE_ZONE = "10859527";
const VIGNETTE_SRC = "https://n6wxm.com/vignette.min.js";

function isEligibleRoute(pathname: string) {
  return pathname === "/mystery-box" || pathname === "/free-tools";
}

export default function MobileMonetagVignette() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isEligibleRoute(pathname || "")) {
      return;
    }

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (!isMobile) {
      return;
    }

    if (window.__monetagVignetteLoaded || document.getElementById(SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.dataset.zone = VIGNETTE_ZONE;
    script.src = VIGNETTE_SRC;

    try {
      (document.body || document.documentElement).appendChild(script);
      window.__monetagVignetteLoaded = true;
    } catch {
      // no-op
    }
  }, [pathname]);

  return null;
}
