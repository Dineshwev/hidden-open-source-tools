"use client";

import { useEffect, useState } from "react";
import HomeMobileLanding from "@/components/home/HomeMobileLanding";
import HomeDesktopLanding from "@/components/home/HomeDesktopLanding";

export default function ResponsiveHomePage() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const applyMatch = () => setIsDesktop(mediaQuery.matches);

    applyMatch();
    mediaQuery.addEventListener("change", applyMatch);

    return () => {
      mediaQuery.removeEventListener("change", applyMatch);
    };
  }, []);

  return isDesktop ? <HomeDesktopLanding /> : <HomeMobileLanding />;
}
