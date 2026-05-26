"use client";

import { Github, X } from "lucide-react";
import { useEffect, useState } from "react";

const DISMISS_KEY = "sponsor_dismissed";
const SPONSOR_URL = "https://github.com/Dineshwev/hidden-open-source-tools";

export default function GitHubSponsorFloat() {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const dismissedThisSession = window.sessionStorage.getItem(DISMISS_KEY) === "true";
    if (dismissedThisSession) {
      setDismissed(true);
      return;
    }

    if (window.localStorage.getItem(DISMISS_KEY) === "true") {
      window.localStorage.removeItem(DISMISS_KEY);
    }

    const timer = window.setTimeout(() => {
      setVisible(true);
    }, 3000);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "true");
    window.sessionStorage.setItem(DISMISS_KEY, "true");
    setVisible(false);
    setDismissed(true);
  };

  const handleOpen = () => {
    window.open(SPONSOR_URL, "_blank", "noopener,noreferrer");
  };

  if (dismissed) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={handleOpen}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur hover:bg-white/20"
          aria-label="Open GitHub sponsor repository"
        >
          <Github className="h-4 w-4" />
          <span>{"\u2B50 Sponsor"}</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-gray-800 text-xs text-white/60 hover:text-white"
          aria-label="Dismiss sponsor button"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
