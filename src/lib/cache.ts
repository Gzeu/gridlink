import { cacheGet, cacheSet } from '@/lib/redis';

/**
 * Typed cache wrapper with namespace-based invalidation.
 * Usage:
 *   const rows = await cache.get<Row[]>('sheet', sheetId);
 *   await cache.set('sheet', sheetId, rows, 300);
 *   await cache.invalidate('sheet', sheetId); // bust one key
 *   await cache.invalidateAll('sheet');        // not possible with Redis without SCAN — use TTL=0
 */
export const cache = {
  key(ns: string, id: string): string {
    return `gl:${ns}:${id}`;
  },

  async get<T>(ns: string, id: string): Promise<T | null> {
    const raw = await cacheGet(this.key(ns, id));
    if (!raw) return null;
    try { return JSON.parse(raw) as T; }
    catch { return null; }
  },

  async set<T>(ns: string, id: string, value: T, ttlSeconds = 300): Promise<void> {
    if (ttlSeconds <= 0) {
      await cacheSet(this.key(ns, id), '', 1); // expire immediately
      return;
    }
    await cacheSet(this.key(ns, id), JSON.stringify(value), ttlSeconds);
  },

  async invalidate(ns: string, id: string): Promise<void> {
    await cacheSet(this.key(ns, id), '', 1);
  },
};
