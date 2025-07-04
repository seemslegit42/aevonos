
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
    maxRetriesPerRequest: 3, // Retry commands on failure
    enableReadyCheck: true,
});

redis.on('error', (err) => {
    console.error('[Cache Service] Could not connect to Redis/DragonflyDB:', err.message);
});

redis.on('connect', () => {
    console.log('[Cache Service] Successfully connected to Redis/DragonflyDB.');
});


if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redis;
}

// Helper to safely get from cache, parsing JSON if it's a string.
const safeGet = async (key: string) => {
    try {
        const data = await redis.get(key);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    } catch(err) {
        console.error(`[Cache] Error parsing data for key ${key}:`, err);
        // If parsing fails, the data is corrupt, so delete it.
        await redis.del(key);
        return null;
    }
}

// Helper to safely set data in cache, stringifying if it's an object.
const safeSet = async (key: string, value: any, options?: any, ttl?: number) => {
    try {
        const valueToSet = typeof value === 'object' ? JSON.stringify(value) : value;
        if (options && ttl) {
            return await redis.set(key, valueToSet, options, ttl);
        }
        return await redis.set(key, valueToSet);
    } catch (err) {
        console.error(`[Cache] Error setting data for key ${key}:`, err);
        return null;
    }
}


// We name it 'cache' to keep the interface abstract, but also export the raw client for advanced use.
const cache = {
    get: safeGet,
    set: safeSet,
    del: (...args: string[]) => redis.del(...args),
    redis, // Exporting the raw client for advanced list/set operations
};

export default cache;
