import { notFound } from "next/navigation";
import Link from "next/link";
import AdminModerationPanel from "@/components/AdminModerationPanel";
import ScrapedToolsAdminPanel from "@/components/ScrapedToolsAdminPanel";

type HiddenAdminPageProps = {
  params: {
    secretPath?: string[];
  };
};

export default function HiddenAdminPage({ params }: HiddenAdminPageProps) {
  const configuredRouteSecret = process.env.ADMIN_PANEL_ROUTE_SECRET || "";
  const configuredSegments = configuredRouteSecret.split("/").filter(Boolean);
  const incomingSegments = params.secretPath || [];
  const isScrapedToolsView = incomingSegments[incomingSegments.length - 1] === "scraped-tools";
  const secretSegments = isScrapedToolsView ? incomingSegments.slice(0, -1) : incomingSegments;

  // Enforce multi-segment secrets so the URL is meaningfully harder to guess.
  if (configuredSegments.length < 3) {
    notFound();
  }

  const matchesSecret =
    configuredSegments.length === secretSegments.length &&
    configuredSegments.every((segment, index) => segment === secretSegments[index]);

  if (!matchesSecret) {
    notFound();
  }

  if (isScrapedToolsView) {
    return <ScrapedToolsAdminPanel />;
  }

  const baseSecretPath = `/control-room/${secretSegments.join("/")}`;
  const scrapedToolsPath = `${baseSecretPath}/scraped-tools`;

  return (
    <div className="space-y-5">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-3 rounded-3xl p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Control Room</p>
          <p className="mt-1 text-sm text-white/70">Jump to scraped tools review queue.</p>
        </div>
        <Link
          href={scrapedToolsPath}
          className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
        >
          Open Scraped Tools
        </Link>
        <div className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.22em] text-white/45">Hidden Route</p>
          <p className="mt-1 break-all font-mono text-sm text-cyan-100/90">{scrapedToolsPath}</p>
        </div>
      </div>
      <AdminModerationPanel />
    </div>
  );
}