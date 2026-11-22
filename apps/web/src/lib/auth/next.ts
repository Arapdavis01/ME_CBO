/**
 * Only allow redirects to paths inside this site.
 * Blocks open-redirect tricks such as "?next=//evil.com" or "?next=https://evil.com".
 */
export function safeNext(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
