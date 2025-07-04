import Memcached from 'memcached';

const globalForMemcached = globalThis as unknown as {
  memcached: Memcached | undefined
}

const memcachedUrl = process.env.MEMCACHED_URL || 'localhost:11211';

// Prevent multiple connections in development
const memcachedInstance =
  globalForMemcached.memcached ??
  new Memcached(memcachedUrl);

memcachedInstance.on('failure', (details) => {
    console.error('[Memcached] Server failure', details);
});
memcachedInstance.on('reconnecting', (details) => {
    console.log('[Memcached] Reconnecting', details);
});
memcachedInstance.on('issue', (details) => {
    console.warn('[Memcached] Server issue', details);
});


if (process.env.NODE_ENV !== 'production') {
    globalForMemcached.memcached = memcachedInstance;
}

// Wrapper to provide a Promise-based API compatible with the old Redis implementation
const cache = {
  get: (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      memcachedInstance.get(key, (err, data) => {
        if (err) {
          console.error(`[Memcached] GET error for key ${key}:`, err);
          return reject(err);
        }
        // Memcached returns false for a cache miss.
        if (data === false || data === undefined) {
            return resolve(null);
        }
        try {
          // Assume stored values are JSON strings
          resolve(JSON.parse(data));
        } catch (e) {
          // If it's not JSON, return the raw data
          resolve(data);
        }
      });
    });
  },
  set: (key: string, value: any, command?: 'EX', lifetime?: number): Promise<'OK'> => {
    return new Promise((resolve, reject) => {
        const stringValue = JSON.stringify(value);
        // Memcached's lifetime is the 3rd argument. The old API had 'EX' as 3rd and lifetime as 4th.
        const effectiveLifetime = lifetime || 0; // 0 means no expiry
        memcachedInstance.set(key, stringValue, effectiveLifetime, (err) => {
            if (err) {
                console.error(`[Memcached] SET error for key ${key}:`, err);
                return reject(err);
            }
            resolve('OK');
        });
    });
  },
  del: (...keys: string[]): Promise<number> => {
      if (keys.length === 0) return Promise.resolve(0);
      
      const deletePromises = keys.map(key => {
          return new Promise<boolean>((resolve, reject) => {
              memcachedInstance.del(key, (err, result) => {
                  if (err) {
                      console.error(`[Memcached] DEL error for key ${key}:`, err);
                      // Don't reject the whole batch, just resolve this one as a failure
                      return resolve(false);
                  }
                  resolve(result);
              });
          });
      });

      return Promise.all(deletePromises).then(results => {
          // Return the count of successful deletions
          return results.filter(Boolean).length;
      });
  }
};

export default cache;