import { createClient, RedisClientType } from 'redis';
import { logger } from './logger';

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (!process.env.REDIS_HOST) return null;

  if (!redisClient) {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    }) as RedisClientType;

    redisClient.on('error', (err) => logger.warn('Redis error (non-fatal):', err.message));
    redisClient.on('connect', () => logger.info('✅ Redis connected'));

    try {
      await redisClient.connect();
    } catch (err) {
      logger.warn('⚠️  Redis unavailable, caching disabled');
      redisClient = null;
    }
  }

  return redisClient;
}

// Graceful cache get — never throws, always falls through on miss
export async function cacheGet(key: string): Promise<string | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;
    return await client.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds = 300): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    await client.setEx(key, ttlSeconds, value);
  } catch {
    // Silently fail — cache is non-critical
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    const keys = await client.keys(pattern);
    if (keys.length > 0) await client.del(keys);
  } catch {
    // Silently fail
  }
}
