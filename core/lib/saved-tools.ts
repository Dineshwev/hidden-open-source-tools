"use client";

export interface SavedToolMeta {
  slug: string;
  name: string;
  url?: string;
  category?: string;
}

export function getSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("cloudrain_saved_slugs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSavedToolsMeta(): SavedToolMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const slugs = getSavedSlugs();
    const rawMeta = localStorage.getItem("cloudrain_saved_tools_meta");
    const metaMap: Record<string, SavedToolMeta> = rawMeta ? JSON.parse(rawMeta) : {};
    return slugs.map((slug) => {
      if (metaMap[slug]) return metaMap[slug];
      // Fallback: title-case slug
      const fallbackName = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return { slug, name: fallbackName };
    });
  } catch {
    return [];
  }
}

export function isToolSaved(slug: string): boolean {
  return getSavedSlugs().includes(slug);
}

export function toggleSaveTool(slug: string, meta?: Partial<SavedToolMeta>): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getSavedSlugs();
    const index = current.indexOf(slug);
    let updated: string[];
    let isNowSaved = false;

    const rawMeta = localStorage.getItem("cloudrain_saved_tools_meta");
    const metaMap: Record<string, SavedToolMeta> = rawMeta ? JSON.parse(rawMeta) : {};

    if (index >= 0) {
      updated = current.filter((s) => s !== slug);
      delete metaMap[slug];
      isNowSaved = false;
    } else {
      updated = [...current, slug];
      const fallbackName = slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      metaMap[slug] = {
        slug,
        name: meta?.name || fallbackName,
        url: meta?.url,
        category: meta?.category,
      };
      isNowSaved = true;
    }

    localStorage.setItem("cloudrain_saved_slugs", JSON.stringify(updated));
    localStorage.setItem("cloudrain_saved_tools_meta", JSON.stringify(metaMap));

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

export function removeSavedTool(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedSlugs();
    const updated = current.filter((s) => s !== slug);
    const rawMeta = localStorage.getItem("cloudrain_saved_tools_meta");
    const metaMap: Record<string, SavedToolMeta> = rawMeta ? JSON.parse(rawMeta) : {};
    delete metaMap[slug];

    localStorage.setItem("cloudrain_saved_slugs", JSON.stringify(updated));
    localStorage.setItem("cloudrain_saved_tools_meta", JSON.stringify(metaMap));

    window.dispatchEvent(
      new CustomEvent("cloudrain:saved-change", {
        detail: { slug, isSaved: false, total: updated.length },
      })
    );
  } catch {}
}

export function clearSavedSlugs(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("cloudrain_saved_slugs");
    localStorage.removeItem("cloudrain_saved_tools_meta");
    window.dispatchEvent(
      new CustomEvent("cloudrain:saved-change", {
        detail: { total: 0 },
      })
    );
  } catch {}
}
