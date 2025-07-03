import Memcached from 'memcached';

const globalForMemcached = globalThis as unknown as {
  memcached: Memcached | undefined
}

const memcachedUrl = process.env.MEMCACHED_URL || 'localhost:11211';

const memcachedInstance =
  globalForMemcached.memcached ??
  new Memcached(memcachedUrl);

if (process.env.NODE_ENV !== 'production') {
    globalForMemcached.memcached = memcachedInstance;
}

memcachedInstance.on('failure', (details) => {
    console.error(`[Memcached] Server ${details.server} went down due to: ${details.messages.join('')}`);
});

memcachedInstance.on('reconnecting', (details) => {
    console.log(`[Memcached] Reconnecting to server ${details.server}...`);
});

// Wrapper to provide a promise-based API similar to ioredis
const cache = {
  get: (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      memcachedInstance.get(key, (err, data) => {
        if (err) return reject(err);
        resolve(data);
      });
    });
  },
  set: (key: string, value: any, command: 'EX' | undefined, lifetime: number): Promise<unknown> => {
    // The memcached library's set doesn't use the 'EX' command, it just takes lifetime in seconds.
    return new Promise((resolve, reject) => {
      memcachedInstance.set(key, value, lifetime, (err) => {
        if (err) return reject(err);
        resolve('OK');
      });
    });
  },
  del: (...keys: string[]): Promise<number> => {
      const promises = keys.map(key => 
          new Promise<boolean>((resolve, reject) => {
              memcachedInstance.del(key, (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
              });
          })
      );
      // Return the count of successful deletions
      return Promise.all(promises).then(results => results.filter(Boolean).length);
  }
};

export default cache;
