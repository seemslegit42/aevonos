
import type { VandelayAlibiOutput } from './vandelay-schemas';
import cache from '@/lib/cache';

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

export async function getCachedAlibi(cacheKey: string): Promise<VandelayAlibiOutput | null> {
    const cachedData = await cache.get(cacheKey);
    if (cachedData) {
        console.log(`[Vandelay Cache] Cache hit for ${cacheKey}.`);
        return cachedData as VandelayAlibiOutput;
    }
    return null;
}

export async function setCachedAlibi(cacheKey: string, alibi: VandelayAlibiOutput): Promise<void> {
  console.log(`[Vandelay Cache] Caching alibi for ${cacheKey}.`);
  await cache.set(cacheKey, alibi, 'EX', CACHE_TTL_SECONDS);
}
