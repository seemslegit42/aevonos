
import type { VandelayAlibiOutput } from './vandelay-schemas';

const CACHE_TTL_MINUTES = 60; // Alibis can be cached for longer

interface CachedAlibi {
  alibi: VandelayAlibiOutput;
  timestamp: number;
}

const alibiCache: Record<string, CachedAlibi> = {};

export function getCachedAlibi(cacheKey: string): VandelayAlibiOutput | null {
  const cached = alibiCache[cacheKey];
  if (!cached) {
    return null;
  }

  const now = Date.now();
  const ageInMinutes = (now - cached.timestamp) / (1000 * 60);

  if (ageInMinutes > CACHE_TTL_MINUTES) {
    console.log(`[Vandelay Cache] Stale entry for ${cacheKey}. Ignoring.`);
    delete alibiCache[cacheKey];
    return null;
  }

  console.log(`[Vandelay Cache] Cache hit for ${cacheKey}.`);
  return cached.alibi;
}

export function setCachedAlibi(cacheKey: string, alibi: VandelayAlibiOutput): void {
  console.log(`[Vandelay Cache] Caching alibi for ${cacheKey}.`);
  alibiCache[cacheKey] = {
    alibi,
    timestamp: Date.now(),
  };
}
