import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

type ToolLink = {
  name: string;
  slug: string;
  type: "tool" | "alternative";
};

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanLine(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/^[-*•]\s*/, "")
    .trim();
}

function extractVerdict(markdown: string, toolName: string): string | null {
  if (!markdown || !toolName) return null;
  const escaped = escapeRegExp(toolName.trim());
  // Matches lines like: "- **Choose Authentik if:** you want..." or "**Pick Plane if**: ..."
  const regex = new RegExp(
    `(?:choose|pick|go with|use)\\s+${escaped}[^:\\n]*:\\s*([^\\n]+)`,
    "i"
  );
  const match = markdown.match(regex);
  if (match?.[1]) {
    const cleaned = cleanLine(match[1]);
    if (cleaned.length >= 20) return cleaned;
  }
  return null;
}

export default function QuickVerdictCard({
  toolA,
  toolB,
  markdown,
  toolLinks = [],
}: {
  toolA: string;
  toolB: string;
  markdown: string;
  toolLinks?: ToolLink[];
}) {
  const verdictA = extractVerdict(markdown, toolA);
  const verdictB = extractVerdict(markdown, toolB);

  if (!verdictA && !verdictB) return null;

  const linkA = toolLinks.find(
    (l) => l.name.toLowerCase() === toolA.toLowerCase() || l.slug.toLowerCase() === toolA.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  );
  const linkB = toolLinks.find(
    (l) => l.name.toLowerCase() === toolB.toLowerCase() || l.slug.toLowerCase() === toolB.toLowerCase().replace(/[^a-z0-9]+/g, "-")
  );

  return (
    <section
      aria-label={`Quick verdict: ${toolA} vs ${toolB}`}
      className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7"
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/90">
          3-Second Decision Guide
        </p>
        <h2 className="mt-1 font-display text-xl font-bold text-white">
          Quick Verdict: {toolA} vs {toolB}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {verdictA && (
          <div className="flex flex-col justify-between rounded-2xl border border-cyan-400/25 bg-cyan-950/20 p-5">
            <div>
              <div className="flex items-center gap-2 text-cyan-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <h3 className="font-display text-base font-bold text-white">
                  Choose {toolA} if…
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                {verdictA}
              </p>
            </div>

            {linkA && (
              <div className="mt-4 pt-3 border-t border-cyan-400/15">
                <Link
                  href={linkA.type === "tool" ? `/tools/${linkA.slug}` : `/alternatives/${linkA.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition"
                >
                  <span>{linkA.type === "tool" ? `Inspect ${linkA.name} Specs` : `All ${linkA.name} Alternatives`}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {verdictB && (
          <div className="flex flex-col justify-between rounded-2xl border border-orange-400/25 bg-orange-950/15 p-5">
            <div>
              <div className="flex items-center gap-2 text-orange-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <h3 className="font-display text-base font-bold text-white">
                  Choose {toolB} if…
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">
                {verdictB}
              </p>
            </div>

            {linkB && (
              <div className="mt-4 pt-3 border-t border-orange-400/15">
                <Link
                  href={linkB.type === "tool" ? `/tools/${linkB.slug}` : `/alternatives/${linkB.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-orange-200 hover:text-orange-100 transition"
                >
                  <span>{linkB.type === "tool" ? `Inspect ${linkB.name} Specs` : `All ${linkB.name} Alternatives`}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
