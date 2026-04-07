import { createClient } from "@supabase/supabase-js";

function readRequiredEnv(name: string) {
  const rawValue = process.env[name];
  const value = typeof rawValue === "string" ? rawValue.trim() : "";

  if (!value) {
    throw new Error(`[supabase-scraper] Missing required environment variable: ${name}`);
  }

  return value;
}

const publicUrl = readRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const adminUrl = readRequiredEnv("SUPABASE_URL");
const adminServiceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

export const supabasePublic = publicAnonKey ? createClient(publicUrl, publicAnonKey) : null;

export const supabaseAdmin = createClient(adminUrl, adminServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
