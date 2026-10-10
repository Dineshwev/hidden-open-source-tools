import { NextResponse } from "next/server";

/**
 * Standard success JSON response.
 */
export function successJson(data: Record<string, unknown>, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

/**
 * Standard error JSON response.
 */
export function errorJson(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

/**
 * Standard catch-block error handler for API routes.
 * Returns a consistent { success: false, error } response.
 */
export function catchError(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal Server Error";
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 }
  );
}

/**
 * Check whether an error is a Supabase connectivity issue and return
 * an appropriate 503 response. Returns `null` if the error is unrelated.
 */
export function handleSupabaseConnectionError(error: unknown): NextResponse | null {
  const message = String((error as Error)?.message || "");
  if (message.includes("Can't reach database server")) {
    return NextResponse.json(
      { error: "Supabase configuration error. Check SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 }
    );
  }
  return null;
}
