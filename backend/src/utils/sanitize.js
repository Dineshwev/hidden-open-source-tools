import sanitizeHtml from "sanitize-html";

export function sanitizeText(value) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}
