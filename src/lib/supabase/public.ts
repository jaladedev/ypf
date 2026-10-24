import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Seconds public pages may be served from cache before re-checking the database. */
export const PUBLIC_REVALIDATE = 300;

/**
 * Cookie-less, anonymous Supabase client for public content (events, jobs, news...).
 * It never carries a session, so Row Level Security shows only published content,
 * and because it reads no cookies the pages that use it can be cached (ISR).
 */
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) =>
          fetch(input, { ...init, next: { revalidate: PUBLIC_REVALIDATE } }),
      },
    },
  );
}
