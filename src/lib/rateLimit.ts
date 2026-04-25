interface Window {
  count:   number;
  resetAt: number;
}

const store = new Map<string, Window>();

interface RateLimitOptions {
  windowMs: number;
  max:      number;
}

export function rateLimit(
  key: string,
  { windowMs = 60_000, max = 30 }: RateLimitOptions,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  let   win = store.get(key);

  if (!win || now > win.resetAt) {
    win = { count: 0, resetAt: now + windowMs };
    store.set(key, win);
  }

  win.count++;
  const allowed   = win.count <= max;
  const remaining = Math.max(0, max - win.count);

  // Prune old keys every ~500 requests to prevent memory leak
  if (store.size > 5_000) {
    for (const [k, v] of store) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  return { allowed, remaining, resetAt: win.resetAt };
}

export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}
