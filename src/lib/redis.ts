
import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis
}

redis.on('error', (err) => console.error('[Redis Client Error]', err));

export default redis;
