import { createClient } from "@supabase/supabase-js";

function readEnv(name: string) {
  const rawValue = process.env[name];
  return typeof rawValue === "string" ? rawValue.trim() : "";
}

function isPlaceholder(value: string) {
  const normalized = value.toLowerCase();
  return !value || normalized.includes("<") || normalized.includes(">") || normalized.includes("your-project-ref") || normalized.includes("replace-with");
}

function isHttpUrl(value: string) {
  if (isPlaceholder(value)) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const publicUrl = readEnv("NEXT_PUBLIC_SUPABASE_URL");
const adminUrl = readEnv("SUPABASE_URL");
const adminServiceRoleKey = readEnv("SUPABASE_SERVICE_ROLE_KEY");
const publicAnonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export const hasSupabasePublicConfig = isHttpUrl(publicUrl) && !isPlaceholder(publicAnonKey);
export const hasSupabaseAdminConfig = isHttpUrl(adminUrl) && !isPlaceholder(adminServiceRoleKey);

export const supabasePublic = hasSupabasePublicConfig ? createClient(publicUrl, publicAnonKey) : null;

export const supabaseAdmin = hasSupabaseAdminConfig
  ? createClient(adminUrl, adminServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;
