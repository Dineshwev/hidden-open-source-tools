import buildToolStructuredData from "../lib/seo/toolStructuredData";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error("Validation failed:", msg);
    process.exit(1);
  }
}

const sample = {
  name: "Example Tool",
  slug: "example-tool",
  category: "UI Kit",
  description: "An example tool used to validate JSON-LD output.",
  url: "https://example.com"
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thecloudrain.site";

const jsonld = buildToolStructuredData(sample, siteUrl, "https://example.com/favicon.ico");

assert(jsonld && jsonld["@context"] === "https://schema.org", "@context missing or incorrect");
assert(Array.isArray(jsonld["@graph"]), "@graph must be an array");

const types = jsonld["@graph"].map((n: any) => n["@type"]).filter(Boolean);
assert(types.includes("SoftwareApplication"), "SoftwareApplication node not found");
assert(types.includes("BreadcrumbList"), "BreadcrumbList node not found");

console.log("JSON-LD validation passed");
process.exit(0);
