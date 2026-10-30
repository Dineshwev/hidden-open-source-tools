function removeStaleYearReferences(value: string): string {
  return value
    .replace(/\b(?:as of|in|for|during)\s+20\d{2}\b/gi, "")
    .replace(/\b20\d{2}\b/g, "")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/([,;:])\s*([|–—-])/g, "$2")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+\|\s*The Cloud Rain(?:\s+\|\s*The Cloud Rain)+\s*$/i, " | The Cloud Rain")
    .replace(/^\s*[|–—,:;-]+|[|–—,:;-]+\s*$/g, "")
    .trim();
}

export function cleanSeoTitle(value: unknown): string {
  return removeStaleYearReferences(String(value ?? ""))
    .replace(/\s+\|\s*The Cloud Rain\s*$/i, "")
    .trim();
}

export function cleanSeoDescription(value: unknown): string {
  return removeStaleYearReferences(String(value ?? ""));
}
