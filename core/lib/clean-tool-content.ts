/**
 * Utility to strip volatile, fast-changing GitHub stats from markdown descriptions.
 * Metrics like Stars, Forks, Open Issues, Contributors, Last Commit date, and Releases
 * fluctuate daily and are instead displayed dynamically via live API badges and stats strips.
 */

const VOLATILE_STAT_LINE_REGEX =
  /^\s*[-*•]?\s*(?:(?:⭐|🍴|🐛|👥|🕐|🏷️|👁️)\s*)?(?:Stars|Forks|Open\s*Issues|Issues|Contributors|Last\s*Commit|Latest\s*Release|Watchers)\s*:\s*.+$/iu;

const GITHUB_STATS_HEADING_REGEX =
  /^#{1,6}\s+(?:GitHub\s+Stats|GitHub\s+Statistics|Repository\s+Stats)\s*$/i;

const ANY_MARKDOWN_HEADING_REGEX = /^#{1,6}\s+.+$/;

/**
 * Cleans tool markdown content by:
 * 1. Removing volatile lines: Stars, Forks, Open Issues, Contributors, Last Commit, Latest Release, Watchers.
 * 2. Removing empty "## GitHub Stats" headings when no content remains in that section.
 * 3. Cleaning up excessive blank lines.
 */
export function cleanToolMarkdownContent(markdown: string | null | undefined): string {
  if (!markdown || typeof markdown !== "string") return "";

  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const output: string[] = [];

  let inGitHubStatsSection = false;
  let gitHubStatsHeaderIndex = -1;
  let statsSectionHasContent = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isHeading = ANY_MARKDOWN_HEADING_REGEX.test(line);

    if (isHeading) {
      if (inGitHubStatsSection) {
        if (!statsSectionHasContent && gitHubStatsHeaderIndex >= 0) {
          output.splice(gitHubStatsHeaderIndex, 1);
        }
        inGitHubStatsSection = false;
        gitHubStatsHeaderIndex = -1;
        statsSectionHasContent = false;
      }

      if (GITHUB_STATS_HEADING_REGEX.test(line)) {
        inGitHubStatsSection = true;
        gitHubStatsHeaderIndex = output.length;
        output.push(line);
        continue;
      }
    }

    // Check if this line is a volatile stat or an empty "Not available" stub row
    if (
      VOLATILE_STAT_LINE_REGEX.test(line) ||
      /^\|\s*[^|]+\|\s*Not available(?:\s+for\s+SaaS|\s+in\s+verified\s+data)?\s*\|$/i.test(line.trim()) ||
      /^[-*]\s*GitHub Repository:\s*Not available/i.test(line.trim())
    ) {
      continue;
    }

    if (inGitHubStatsSection) {
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        statsSectionHasContent = true;
        output.push(line);
      } else if (statsSectionHasContent) {
        // Keep spacing only after valid content within the section
        output.push(line);
      }
      continue;
    }

    output.push(line);
  }

  // Handle case where GitHub Stats was the last section
  if (inGitHubStatsSection && !statsSectionHasContent && gitHubStatsHeaderIndex >= 0) {
    output.splice(gitHubStatsHeaderIndex, 1);
  }

  // Normalize line breaks: max 2 consecutive newlines, trim trailing whitespace
  return output
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
