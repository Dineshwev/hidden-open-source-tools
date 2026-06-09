import { isMobileUserAgent } from "@/lib/utils/device";

describe("isMobileUserAgent", () => {
  it("returns true for Android user agents", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0 Mobile"
      )
    ).toBe(true);
  });

  it("returns true for iPhone user agents", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1"
      )
    ).toBe(true);
  });

  it("returns true for iPad user agents", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1"
      )
    ).toBe(true);
  });

  it("returns true for iPod user agents", () => {
    expect(isMobileUserAgent("Mozilla/5.0 (iPod touch; CPU) AppleWebKit")).toBe(true);
  });

  it("returns true for Opera Mini", () => {
    expect(isMobileUserAgent("Opera/9.80 (J2ME/MIDP; Opera Mini)")).toBe(true);
  });

  it("returns true for IEMobile", () => {
    expect(isMobileUserAgent("Mozilla/5.0 (compatible; MSIE; IEMobile)")).toBe(true);
  });

  it("returns false for desktop Chrome", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0"
      )
    ).toBe(false);
  });

  it("returns false for desktop Firefox", () => {
    expect(
      isMobileUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0"
      )
    ).toBe(false);
  });

  it("returns false for null", () => {
    expect(isMobileUserAgent(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isMobileUserAgent(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isMobileUserAgent("")).toBe(false);
  });
});
