import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Prevent multiple connections in development
const redisInstance =
  globalForRedis.redis ??
  new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      // Add other options as needed, e.g., for TLS if using a cloud provider
  });
  
redisInstance.on('error', (err) => console.error('[Redis] Connection Error', err));
redisInstance.on('connect', () => console.log('[Redis] Connected successfully.'));
redisInstance.on('reconnecting', () => console.log('[Redis] Reconnecting...'));

if (process.env.NODE_ENV !== 'production') {
    globalForRedis.redis = redisInstance;
}

// Wrapper to provide a consistent API surface with the old implementation
const cache = {
  get: async (key: string): Promise<any> => {
    const value = await redisInstance.get(key);
    // ioredis returns null for non-existent keys. The old implementation returned 'any' so this is compatible.
    // We assume stored values are JSON strings.
    return value ? JSON.parse(value) : null;
  },
  set: async (key: string, value: any, command?: 'EX', lifetime?: number): Promise<'OK'> => {
      const stringValue = JSON.stringify(value);
      if (command === 'EX' && lifetime) {
          return redisInstance.set(key, stringValue, 'EX', lifetime);
      }
      return redisInstance.set(key, stringValue);
  },
  del: async (...keys: string[]): Promise<number> => {
      if (keys.length === 0) return 0;
      return redisInstance.del(...keys);
  }
};

export default cache;
