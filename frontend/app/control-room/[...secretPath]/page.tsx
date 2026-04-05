import { notFound } from "next/navigation";
import AdminModerationPanel from "@/components/AdminModerationPanel";

type HiddenAdminPageProps = {
  params: {
    secretPath?: string[];
  };
};

export default function HiddenAdminPage({ params }: HiddenAdminPageProps) {
  const configuredRouteSecret = process.env.ADMIN_PANEL_ROUTE_SECRET || "";
  const configuredSegments = configuredRouteSecret.split("/").filter(Boolean);
  const incomingSegments = params.secretPath || [];

  // Enforce multi-segment secrets so the URL is meaningfully harder to guess.
  if (configuredSegments.length < 3) {
    notFound();
  }

  const matchesSecret =
    configuredSegments.length === incomingSegments.length &&
    configuredSegments.every((segment, index) => segment === incomingSegments[index]);

  if (!matchesSecret) {
    notFound();
  }

  return <AdminModerationPanel />;
}