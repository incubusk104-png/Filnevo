/**
 * Sanitize a post-authentication `next` redirect target.
 *
 * Only same-origin, absolute application paths are allowed so the `next`
 * parameter can never be abused as an open redirect (e.g. `//evil.com` or
 * `https://evil.com`). Anything that isn't a plain `/path` falls back to the
 * home route.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/",
): string {
  if (!next) return fallback;

  // Must be a root-relative path. Reject protocol-relative (`//host`),
  // backslash tricks (`/\host`) and absolute URLs with a scheme.
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;

  return next;
}
