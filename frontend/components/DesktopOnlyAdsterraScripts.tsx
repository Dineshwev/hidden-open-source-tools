"use client";

import { useEffect, useState } from "react";
import AdsterraScripts from "@/components/AdsterraScripts";

export default function DesktopOnlyAdsterraScripts() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mediaQuery.matches);

    apply();
    mediaQuery.addEventListener("change", apply);

    return () => {
      mediaQuery.removeEventListener("change", apply);
    };
  }, []);

  if (!isDesktop) {
    return null;
  }

  return <AdsterraScripts />;
}
