"use client";

export function getSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cloudrain_saved_slugs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isToolSaved(slug: string): boolean {
  return getSavedSlugs().includes(slug);
}

export function toggleSaveTool(slug: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getSavedSlugs();
    const index = current.indexOf(slug);
    let updated: string[];
    let isNowSaved = false;
    if (index >= 0) {
      updated = current.filter((s) => s !== slug);
      isNowSaved = false;
    } else {
      updated = [...current, slug];
      isNowSaved = true;
    }
    localStorage.setItem("cloudrain_saved_slugs", JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent("cloudrain:saved-change", {
        detail: { slug, isSaved: isNowSaved, total: updated.length },
      })
    );
    return isNowSaved;
  } catch {
    return false;
  }
}
