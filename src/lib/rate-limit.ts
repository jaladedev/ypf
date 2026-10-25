import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

/** Best-effort client address behind Vercel/proxies. Only ever hashed, never stored. */
async function clientAddress() {
  const h = await headers();
  return (
    h.get("x-vercel-forwarded-for") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Fixed-window limit per client for one action, e.g. rateLimit("contact", 5, 3600).
 * Returns false when the caller should be turned away. If the limiter itself fails
 * (database hiccup) it lets the request through: a broken limiter must not take the
 * contact form or sign-up down.
 */
export async function rateLimit(action: string, limit: number, windowSeconds: number) {
  try {
    const ip = await clientAddress();
    const salt = process.env.RATE_LIMIT_SALT ?? "ypf";
    const key = `${action}:${createHash("sha256").update(`${salt}|${ip}`).digest("hex").slice(0, 32)}`;
    const { data, error } = await createAdminClient().rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error("rate limit", error.message);
      return true;
    }
    return data !== false;
  } catch (e) {
    console.error("rate limit", e);
    return true;
  }
}

export const TOO_MANY = "Too many attempts from your connection. Please wait a while and try again.";
