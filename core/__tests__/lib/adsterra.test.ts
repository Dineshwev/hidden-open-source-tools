import {
  getAdsterraVerificationCode,
  getAdsterraBannerKeyForSize,
  getAdsterraBannerScriptUrlForSize,
  getAdsterraSmartlinkUrls,
  getAdsterraSmartlinkUrl,
  getAdsterraPopunderScriptUrl,
  getAdsterraPopunderSnippet,
  getAdsterraSocialBarScriptUrl,
  getAdsterraSocialBarSnippet,
  getAdsterraNativeBannerScriptUrl,
  getAdsterraInterstitialScriptUrl,
  getAdsterraWaitSeconds
} from "@/lib/adsterra";

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("getAdsterraVerificationCode", () => {
  it("returns the env value when set", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_VERIFICATION_CODE = "myCode123";
    expect(getAdsterraVerificationCode()).toBe("myCode123");
  });

  it("returns default when env is not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_VERIFICATION_CODE;
    expect(getAdsterraVerificationCode()).toBe("0BWqbyw168nW");
  });

  it("trims whitespace", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_VERIFICATION_CODE = "  spaced  ";
    expect(getAdsterraVerificationCode()).toBe("spaced");
  });
});

describe("getAdsterraBannerKeyForSize", () => {
  it("returns empty string when width or height is missing", () => {
    expect(getAdsterraBannerKeyForSize()).toBe("");
    expect(getAdsterraBannerKeyForSize(468)).toBe("");
    expect(getAdsterraBannerKeyForSize(undefined, 60)).toBe("");
  });

  it("returns the env value for a known size", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_468X60_KEY = "key468";
    expect(getAdsterraBannerKeyForSize(468, 60)).toBe("key468");
  });

  it("returns empty string for unknown size", () => {
    expect(getAdsterraBannerKeyForSize(999, 999)).toBe("");
  });

  it("returns empty string when env is not set for a known size", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY;
    expect(getAdsterraBannerKeyForSize(300, 250)).toBe("");
  });
});

describe("getAdsterraBannerScriptUrlForSize", () => {
  it("returns the script URL when a banner key exists", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY = "abc123";
    expect(getAdsterraBannerScriptUrlForSize(300, 250)).toBe(
      "https://www.highperformanceformat.com/abc123/invoke.js"
    );
  });

  it("returns empty string when no key exists", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_BANNER_300X250_KEY;
    expect(getAdsterraBannerScriptUrlForSize(300, 250)).toBe("");
  });
});

describe("getAdsterraSmartlinkUrls", () => {
  it("returns empty array when env is not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URLS;
    expect(getAdsterraSmartlinkUrls()).toEqual([]);
  });

  it("parses CSV of URLs filtering non-HTTP values", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URLS =
      "https://example.com, not-a-url, http://other.com";
    expect(getAdsterraSmartlinkUrls()).toEqual([
      "https://example.com",
      "http://other.com"
    ]);
  });
});

describe("getAdsterraSmartlinkUrl", () => {
  it("returns the first valid HTTP URL", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URLS =
      "invalid, https://first.com, https://second.com";
    expect(getAdsterraSmartlinkUrl()).toBe("https://first.com");
  });

  it("returns empty string when nothing valid is configured", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_SMARTLINK_URLS;
    expect(getAdsterraSmartlinkUrl()).toBe("");
  });
});

describe("getAdsterraPopunderScriptUrl", () => {
  it("returns the env value when set", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SCRIPT_URL = "https://pop.example.com";
    expect(getAdsterraPopunderScriptUrl()).toBe("https://pop.example.com");
  });

  it("returns empty string when not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SCRIPT_URL;
    expect(getAdsterraPopunderScriptUrl()).toBe("");
  });
});

describe("getAdsterraPopunderSnippet", () => {
  it("returns the env value", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SNIPPET = "<script>pop</script>";
    expect(getAdsterraPopunderSnippet()).toBe("<script>pop</script>");
  });

  it("returns empty string when not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_SNIPPET;
    expect(getAdsterraPopunderSnippet()).toBe("");
  });
});

describe("getAdsterraSocialBarScriptUrl", () => {
  it("returns env value when set", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SCRIPT_URL = "https://social.example.com";
    expect(getAdsterraSocialBarScriptUrl()).toBe("https://social.example.com");
  });

  it("returns empty string when not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SCRIPT_URL;
    expect(getAdsterraSocialBarScriptUrl()).toBe("");
  });
});

describe("getAdsterraSocialBarSnippet", () => {
  it("returns env value when set", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SNIPPET = "<div>bar</div>";
    expect(getAdsterraSocialBarSnippet()).toBe("<div>bar</div>");
  });

  it("returns empty string when not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_SNIPPET;
    expect(getAdsterraSocialBarSnippet()).toBe("");
  });
});

describe("getAdsterraNativeBannerScriptUrl", () => {
  it("returns env value when set", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_BANNER_SCRIPT_URL = "https://native.example.com";
    expect(getAdsterraNativeBannerScriptUrl()).toBe("https://native.example.com");
  });

  it("returns empty string when not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_NATIVE_BANNER_SCRIPT_URL;
    expect(getAdsterraNativeBannerScriptUrl()).toBe("");
  });
});

describe("getAdsterraInterstitialScriptUrl", () => {
  it("returns env value when set", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_INTERSTITIAL_SCRIPT_URL = "https://inter.example.com";
    expect(getAdsterraInterstitialScriptUrl()).toBe("https://inter.example.com");
  });

  it("returns empty string when not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_INTERSTITIAL_SCRIPT_URL;
    expect(getAdsterraInterstitialScriptUrl()).toBe("");
  });
});

describe("getAdsterraWaitSeconds", () => {
  it("returns default (6) when env is not set", () => {
    delete process.env.NEXT_PUBLIC_ADSTERRA_WAIT_SECONDS;
    expect(getAdsterraWaitSeconds()).toBe(6);
  });

  it("clamps value to minimum of 5", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_WAIT_SECONDS = "2";
    expect(getAdsterraWaitSeconds()).toBe(5);
  });

  it("clamps value to maximum of 30", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_WAIT_SECONDS = "100";
    expect(getAdsterraWaitSeconds()).toBe(30);
  });

  it("floors decimal values", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_WAIT_SECONDS = "12.9";
    expect(getAdsterraWaitSeconds()).toBe(12);
  });

  it("returns default for non-numeric values", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_WAIT_SECONDS = "not-a-number";
    expect(getAdsterraWaitSeconds()).toBe(6);
  });

  it("returns the value when within range", () => {
    process.env.NEXT_PUBLIC_ADSTERRA_WAIT_SECONDS = "15";
    expect(getAdsterraWaitSeconds()).toBe(15);
  });
});
