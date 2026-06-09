import {
  ADMIN_SESSION_COOKIE,
  getConfiguredAdminSecret,
  getLegacyAdminToken,
  isValidAdminSessionCookieValue,
  isValidLegacyAdminToken
} from "@/lib/admin-session";

const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

afterAll(() => {
  process.env = originalEnv;
});

describe("ADMIN_SESSION_COOKIE", () => {
  it("is the expected constant", () => {
    expect(ADMIN_SESSION_COOKIE).toBe("admin_session_v1");
  });
});

describe("getConfiguredAdminSecret", () => {
  it("returns the trimmed env value when set", () => {
    process.env.ADMIN_SECRET = "  my-secret  ";
    expect(getConfiguredAdminSecret()).toBe("my-secret");
  });

  it("returns undefined when env is not set", () => {
    delete process.env.ADMIN_SECRET;
    expect(getConfiguredAdminSecret()).toBeUndefined();
  });
});

describe("getLegacyAdminToken", () => {
  function makeRequest(headers: Record<string, string> = {}): Request {
    return new Request("https://example.com", { headers });
  }

  it("returns Authorization header when present", () => {
    const req = makeRequest({ Authorization: "Bearer token123" });
    expect(getLegacyAdminToken(req)).toBe("Bearer token123");
  });

  it("returns x-admin-token header when Authorization is absent", () => {
    const req = makeRequest({ "x-admin-token": "legacy-token" });
    expect(getLegacyAdminToken(req)).toBe("legacy-token");
  });

  it("prefers Authorization over x-admin-token", () => {
    const req = makeRequest({
      Authorization: "Bearer auth",
      "x-admin-token": "legacy"
    });
    expect(getLegacyAdminToken(req)).toBe("Bearer auth");
  });

  it("returns null when no headers are present", () => {
    const req = makeRequest();
    expect(getLegacyAdminToken(req)).toBeNull();
  });
});

describe("isValidAdminSessionCookieValue", () => {
  it("returns false for undefined value", async () => {
    expect(await isValidAdminSessionCookieValue(undefined)).toBe(false);
  });

  it("returns false for empty string", async () => {
    expect(await isValidAdminSessionCookieValue("")).toBe(false);
  });

  it("returns false when ADMIN_SECRET is not configured", async () => {
    delete process.env.ADMIN_SECRET;
    expect(await isValidAdminSessionCookieValue("some-value")).toBe(false);
  });

  it("returns true when value matches the secret", async () => {
    process.env.ADMIN_SECRET = "test-secret";
    expect(await isValidAdminSessionCookieValue("test-secret")).toBe(true);
  });

  it("returns false when value does not match the secret", async () => {
    process.env.ADMIN_SECRET = "test-secret";
    expect(await isValidAdminSessionCookieValue("wrong-secret")).toBe(false);
  });
});

describe("isValidLegacyAdminToken", () => {
  it("returns false for null", () => {
    expect(isValidLegacyAdminToken(null)).toBe(false);
  });

  it("returns false when ADMIN_SECRET is not configured", () => {
    delete process.env.ADMIN_SECRET;
    expect(isValidLegacyAdminToken("some-token")).toBe(false);
  });

  it("returns true when token matches secret", () => {
    process.env.ADMIN_SECRET = "admin-pass";
    expect(isValidLegacyAdminToken("admin-pass")).toBe(true);
  });

  it("returns false when token does not match", () => {
    process.env.ADMIN_SECRET = "admin-pass";
    expect(isValidLegacyAdminToken("wrong-pass")).toBe(false);
  });
});
