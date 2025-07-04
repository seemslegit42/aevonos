import Redis from 'ioredis';

// This file configures the connection to our caching layer.
// We are using DragonflyDB, which is a Redis-compatible in-memory data store.
// The `ioredis` client is used to connect to it.

// To avoid creating a new connection on every hot-reload in dev
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = globalForRedis.redis ?? new Redis(redisUrl, {
    // Options to ensure robust connection for production environments
    maxRetriesPerRequest: null,
});

redis.on('error', (err) => {
    console.error('[Cache Service] Could not connect to Redis/DragonflyDB:', err);
});

redis.on('connect', () => {
    console.log('[Cache Service] Successfully connected to Redis/DragonflyDB.');
});


if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}

// We name it 'cache' to keep the interface abstract.
const cache = redis;

export default cache;
