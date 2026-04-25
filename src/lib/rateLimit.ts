/**
 * Lightweight in-memory rate limiter for Next.js API routes.
 * Suitable for Vercel serverless (per-instance, resets on cold start).
 * For production multi-instance deployments, replace with Redis-backed sliding window.
 *
 * Usage:
 *   const result = rateLimit(ip, { windowMs: 60_000, max: 30 });
 *   if (!result.allowed) return err('Too many requests', 429);
 */

interface RateLimitEntry {
  count:     number;
  windowEnd: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  /** Window size in milliseconds. Default: 60 000 (1 minute). */
  windowMs?: number;
  /** Max requests allowed in the window. Default: 60. */
  max?: number;
}

export interface RateLimitResult {
  allowed:    boolean;
  remaining:  number;
  resetAt:    number; // Unix ms
}

export function rateLimit(
  key:     string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const { windowMs = 60_000, max = 60 } = options;
  const now  = Date.now();

  const entry = store.get(key);

  if (!entry || now > entry.windowEnd) {
    // New window
    store.set(key, { count: 1, windowEnd: now + windowMs });
    return { allowed: true, remaining: max - 1, resetAt: now + windowMs };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, resetAt: entry.windowEnd };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count, resetAt: entry.windowEnd };
}

/** Extract the real client IP from Next.js request headers. */
export function getClientIp(request: Request): string {
  const xff = (request.headers as Headers).get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return 'unknown';
}
