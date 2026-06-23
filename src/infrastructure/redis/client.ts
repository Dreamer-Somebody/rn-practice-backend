import { Redis } from 'ioredis';
import { env } from '../../config/env.js';

const globalForRedis = globalThis as typeof globalThis & {
  redis?: Redis;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

export async function connectRedis() {
  if (redis.status === 'wait') {
    await redis.connect();
  }

  return redis;
}

export async function disconnectRedis() {
  if (redis.status === 'end') {
    return;
  }

  await redis.quit();
}

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}
