import { buildToolStructuredData } from "@/lib/seo/toolStructuredData";

const SITE_URL = "https://www.thecloudrain.org";

describe("buildToolStructuredData", () => {
  const baseTool = {
    name: "TestTool",
    slug: "test-tool",
    category: "Developer Tools",
    description: "A great  test\n  tool",
    url: "https://github.com/example/test-tool"
  };

  it("returns a valid JSON-LD graph with @context", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL);
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@graph"]).toHaveLength(3);
  });

  it("builds the correct page URL from slug", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL);
    const webPage = result["@graph"][0];
    expect(webPage.url).toBe("https://www.thecloudrain.org/tools/test-tool");
  });

  it("strips trailing slash from siteUrl", () => {
    const result = buildToolStructuredData(baseTool, "https://example.com/");
    const webPage = result["@graph"][0];
    expect(webPage.url).toBe("https://example.com/tools/test-tool");
  });

  it("cleans description whitespace", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL);
    const webPage = result["@graph"][0];
    expect(webPage.description).toBe("A great test tool");
  });

  it("builds breadcrumbs with 3 items", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL);
    const breadcrumb = result["@graph"][1];
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[0].name).toBe("Home");
    expect(breadcrumb.itemListElement[1].name).toBe("Tools");
    expect(breadcrumb.itemListElement[2].name).toBe("TestTool");
  });

  it("uses tool.url for SoftwareApplication URL when provided", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL);
    const app = result["@graph"][2];
    expect(app["@type"]).toBe("SoftwareApplication");
    expect(app.url).toBe("https://github.com/example/test-tool");
  });

  it("falls back to page URL when tool.url is absent", () => {
    const { url, ...toolNoUrl } = baseTool;
    const result = buildToolStructuredData(toolNoUrl, SITE_URL);
    const app = result["@graph"][2];
    expect(app.url).toBe("https://www.thecloudrain.org/tools/test-tool");
  });

  it("uses tool.category as applicationCategory", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL);
    const app = result["@graph"][2];
    expect(app.applicationCategory).toBe("Developer Tools");
  });

  it("defaults applicationCategory to 'Developer Resource'", () => {
    const { category, ...toolNoCat } = baseTool;
    const result = buildToolStructuredData(toolNoCat, SITE_URL);
    const app = result["@graph"][2];
    expect(app.applicationCategory).toBe("Developer Resource");
  });

  it("extracts publisher hostname from tool.url", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL);
    const app = result["@graph"][2];
    expect(app.publisher.name).toBe("github.com");
  });

  it("strips www prefix from publisher hostname", () => {
    const tool = { ...baseTool, url: "https://www.example.com/tool" };
    const result = buildToolStructuredData(tool, SITE_URL);
    const app = result["@graph"][2];
    expect(app.publisher.name).toBe("example.com");
  });

  it("sets publisher to 'External publisher' when url is absent", () => {
    const { url, ...toolNoUrl } = baseTool;
    const result = buildToolStructuredData(toolNoUrl, SITE_URL);
    const app = result["@graph"][2];
    expect(app.publisher.name).toBe("External publisher");
  });

  it("includes faviconUrl as image when provided", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL, "https://img.com/fav.png");
    const app = result["@graph"][2];
    expect(app.image).toBe("https://img.com/fav.png");
  });

  it("omits image when faviconUrl is not provided", () => {
    const result = buildToolStructuredData(baseTool, SITE_URL);
    const app = result["@graph"][2];
    expect(app.image).toBeUndefined();
  });

  it("handles empty description gracefully", () => {
    const tool = { ...baseTool, description: "" };
    const result = buildToolStructuredData(tool, SITE_URL);
    const webPage = result["@graph"][0];
    expect(webPage.description).toBe("");
  });
});
