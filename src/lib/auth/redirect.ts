/**
 * Only allow same-site relative paths as post-login redirect targets, so a
 * crafted `?next=` can't send people to another website (open redirect).
 */
export function safeNext(value: string | null | undefined, fallback = "/dashboard") {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
