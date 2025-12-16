import { Redis } from '@upstash/redis';

// Upstash Redis client for serverless caching
// Free tier: 100 API calls/day, 10GB storage
let redis: Redis | null = null;

function initRedis() {
  if (!redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.warn(
        'Upstash Redis not configured. Caching will be disabled.',
      );
      return null;
    }

    redis = new Redis({
      url,
      token,
    });
  }
  return redis;
}

// Cache helper functions
export async function cacheGet(key: string) {
  try {
    const client = initRedis();
    if (!client) return null;
    return await client.get(key);
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: any,
  exSeconds: number = 3600,
) {
  try {
    const client = initRedis();
    if (!client) return false;
    await client.setex(key, exSeconds, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
}

export async function cacheDel(key: string) {
  try {
    const client = initRedis();
    if (!client) return false;
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Redis del error:', error);
    return false;
  }
}

export async function cacheFlush() {
  try {
    const client = initRedis();
    if (!client) return false;
    await client.flushall();
    return true;
  } catch (error) {
    console.error('Redis flush error:', error);
    return false;
  }
}

export const redisClient = redis;
