import type { Metadata } from "next";
import GeneralQueriesClient from "@/components/contact/GeneralQueriesClient";

export const metadata: Metadata = {
  title: "General Queries",
  description: "Anonymous questions answered publicly to help the whole community.",
  alternates: {
    canonical: "/general-queries"
  }
};

export default function GeneralQueriesPage() {
  return <GeneralQueriesClient />;
}