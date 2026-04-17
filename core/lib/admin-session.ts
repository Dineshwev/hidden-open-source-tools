
export const ADMIN_SESSION_COOKIE = "admin_session_v1";

export function getConfiguredAdminSecret(): string | undefined {
  return process.env.ADMIN_SECRET?.trim();
}

export function getLegacyAdminToken(req: Request): string | null {
  // Check Authorization header first (New system)
  const authHeader = req.headers.get("Authorization");
  if (authHeader) return authHeader;

  // Check custom header (Legacy)
  const legacyHeader = req.headers.get("x-admin-token");
  if (legacyHeader) return legacyHeader;

  return null;
}

export async function isValidAdminSessionCookieValue(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const secret = getConfiguredAdminSecret();
  if (!secret) return false;
  
  // For simplicity, if they have the secret in the cookie, it's valid
  // (In a real system you'd use a signed JWT or session ID)
  return value === secret;
}

export function isValidLegacyAdminToken(token: string | null): boolean {
  if (!token) return false;
  const secret = getConfiguredAdminSecret();
  if (!secret) return false;
  
  return token === secret;
}
