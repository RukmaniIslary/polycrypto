import { createClient } from "@supabase/supabase-js";

// Client-side Supabase (lazy init to avoid build-time errors)
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    if (!url || !key) {
      // Return a dummy client during build/SSR without env vars
      return createClient("https://placeholder.supabase.co", "placeholder");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Convenience export for client components
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return getSupabase()[prop as keyof ReturnType<typeof createClient>];
  },
});

// Server-side admin client (only use in API routes)
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) {
    throw new Error("Supabase env vars not configured");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
