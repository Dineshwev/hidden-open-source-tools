import { getSiteUrl } from "@/lib/site-url";

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("getSiteUrl", () => {
  it("returns the env value when NEXT_PUBLIC_SITE_URL is set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://custom.example.com";
    expect(getSiteUrl()).toBe("https://custom.example.com");
  });

  it("trims whitespace from env value", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "  https://custom.example.com  ";
    expect(getSiteUrl()).toBe("https://custom.example.com");
  });

  it("returns default URL when env is not set", () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe("https://www.thecloudrain.org");
  });

  it("returns default URL when env is empty string", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "";
    expect(getSiteUrl()).toBe("https://www.thecloudrain.org");
  });

  it("returns default URL when env is whitespace only", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "   ";
    expect(getSiteUrl()).toBe("https://www.thecloudrain.org");
  });
});
