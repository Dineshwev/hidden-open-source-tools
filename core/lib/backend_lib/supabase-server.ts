import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, Json | undefined>;
        Insert: Record<string, Json | undefined>;
        Update: Record<string, Json | undefined>;
        Relationships: never[];
      }
    >;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, never>;
  };
};

function readEnv(name: string): string {
  const value = process.env[name];
  return typeof value === "string" ? value.trim() : "";
}

function isPlaceholder(value: string): boolean {
  const normalized = value.toLowerCase();
  return (
    !value ||
    normalized === "undefined" ||
    normalized === "null" ||
    normalized.includes("replace-with") ||
    normalized.includes("your-project-ref") ||
    normalized.includes("<") ||
    normalized.includes(">")
  );
}

function getSupabaseUrl(): string {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL") || readEnv("SUPABASE_URL");

  if (isPlaceholder(url)) {
    throw new Error("Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  }

  return url;
}

function getPublicAnonKey(): string {
  const key = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (isPlaceholder(key)) {
    throw new Error("Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return key;
}

function getServiceRoleKey(): string {
  const key = readEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (isPlaceholder(key)) {
    throw new Error("Missing Supabase service role key. Set SUPABASE_SERVICE_ROLE_KEY.");
  }

  return key;
}

function createServerClient(apiKey: string): SupabaseClient<Database> {
  return createClient<Database>(getSupabaseUrl(), apiKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}

export function getSupabaseAdmin(): SupabaseClient<Database> {
  return createServerClient(getServiceRoleKey());
}

export function getSupabasePublic(): SupabaseClient<Database> {
  return createServerClient(getPublicAnonKey());
}

let _admin: SupabaseClient<Database> | null = null;
let _public: SupabaseClient<Database> | null = null;

export function getAdmin(): SupabaseClient<Database> {
  if (!_admin) _admin = getSupabaseAdmin();
  return _admin;
}

export function getPublic(): SupabaseClient<Database> {
  if (!_public) _public = getSupabasePublic();
  return _public;
}
