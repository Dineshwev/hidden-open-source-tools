import crypto from "crypto";

export const ADMIN_SESSION_COOKIE = "admin_session_v1";

/** Constant-time string comparison to prevent timing attacks. */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still run timingSafeEqual on equal-length buffers to avoid leaking length.
    const dummy = Buffer.alloc(b.length);
    crypto.timingSafeEqual(dummy, Buffer.from(b, "utf8"));
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

export function getConfiguredAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim();
}

export function getLegacyAdminToken(req: Request): string | null {
  const authHeader = req.headers.get("Authorization");
  if (authHeader) return authHeader;

  const legacyHeader = req.headers.get("x-admin-token");
  if (legacyHeader) return legacyHeader;

  return null;
}

export async function isValidAdminSessionCookieValue(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const secret = getConfiguredAdminSecret();
  if (!secret) return false;

  return safeCompare(value, secret);
}

export function isValidLegacyAdminToken(token: string | null): boolean {
  if (!token) return false;
  const secret = getConfiguredAdminSecret();
  if (!secret) return false;

  return safeCompare(token, secret);
}
