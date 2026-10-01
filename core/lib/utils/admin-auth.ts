import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  getConfiguredAdminSecret,
  getLegacyAdminToken,
  isValidAdminSessionCookieValue,
  isValidLegacyAdminToken
} from "@/lib/admin-session";

type AuthSuccess = { ok: true };
type AuthFailure = { ok: false; status: number; error: string };
export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Extracts admin token from request headers.
 * Checks x-admin-access-key, Bearer token, and raw Authorization header.
 */
function extractAdminToken(req: Request): string {
  const authHeader = req.headers.get("authorization") || "";
  const accessKeyHeader = req.headers.get("x-admin-access-key") || "";
  const tokenFromAccessHeader = accessKeyHeader.trim();
  const tokenFromBearer = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  const tokenFromRawAuth = !authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.trim()
    : "";
  return tokenFromAccessHeader || tokenFromBearer || tokenFromRawAuth;
}

/**
 * Header-only admin authorization (no cookie check).
 * Used by scraped-tools and similar routes that rely on header tokens.
 */
export function isAuthorizedByHeader(req: Request): AuthResult {
  const adminSecret = getConfiguredAdminSecret();
  const token = extractAdminToken(req);

  if (!adminSecret) {
    return {
      ok: false,
      status: 503,
      error: "Admin auth is not configured. Set ADMIN_SECRET."
    };
  }

  if (!token || token !== adminSecret) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  return { ok: true };
}

/**
 * Cookie + legacy-token admin authorization.
 * Checks the session cookie first, then falls back to legacy header token.
 * Used by pending-uploads, moderation-history, uploads, etc.
 */
export async function isAuthorizedBySession(req: Request): Promise<AuthResult> {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (await isValidAdminSessionCookieValue(sessionCookie)) {
    return { ok: true };
  }

  if (!getConfiguredAdminSecret()) {
    return { ok: false, status: 503, error: "Admin panel is not configured. Set ADMIN_SECRET." };
  }

  if (!isValidLegacyAdminToken(getLegacyAdminToken(req))) {
    return { ok: false, status: 401, error: "Invalid admin secret." };
  }

  return { ok: true };
}

/**
 * Boolean-returning admin verification.
 * Checks cookie first, then falls back to legacy token.
 * Used by articles, weekly-roundups, etc.
 */
export async function verifyAdmin(req: Request): Promise<boolean> {
  const sessionCookie = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (await isValidAdminSessionCookieValue(sessionCookie)) {
    return true;
  }

  if (!getConfiguredAdminSecret()) {
    return false;
  }

  return isValidLegacyAdminToken(getLegacyAdminToken(req));
}
