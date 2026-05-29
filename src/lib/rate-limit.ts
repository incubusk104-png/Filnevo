/**
 * LOCK 1 — Edge rate limiter.
 *
 * A fixed-window counter keyed by client identifier. Runs at the edge in front
 * of /api/process-document so abusive bursts are rejected before they reach the
 * database quota function (Lock 2). The in-memory store is per-isolate; in
 * production back it with a durable store (e.g. Upstash Redis / Vercel KV).
 */

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

interface WindowState {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 30; // per identifier per window

const store = new Map<string, WindowState>();

export function rateLimit(
  identifier: string,
  max: number = MAX_REQUESTS,
  windowMs: number = WINDOW_MS,
): RateLimitResult {
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing || existing.resetAt <= now) {
    store.set(identifier, { count: 1, resetAt: now + windowMs });
    return { allowed: true, limit: max, remaining: max - 1, resetMs: windowMs };
  }

  existing.count += 1;
  const remaining = Math.max(max - existing.count, 0);
  return {
    allowed: existing.count <= max,
    limit: max,
    remaining,
    resetMs: existing.resetAt - now,
  };
}
