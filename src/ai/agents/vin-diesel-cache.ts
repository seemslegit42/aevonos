
import type { VinDieselOutput } from './vin-diesel-schemas';
import cache from '@/lib/cache';

const CACHE_TTL_SECONDS = 10 * 60; // 10 minutes

export async function getCachedValidation(vin: string): Promise<VinDieselOutput | null> {
  const key = `vin-validation:${vin.toUpperCase()}`;
  const cachedData = await cache.get(key);
  if (cachedData) {
    console.log(`[VIN Diesel Cache] Cache hit for ${key}.`);
    return cachedData as VinDieselOutput;
  }
  return null;
}

export async function setCachedValidation(vin: string, result: VinDieselOutput): Promise<void> {
  const key = `vin-validation:${vin.toUpperCase()}`;
  console.log(`[VIN Diesel Cache] Caching result for ${key}.`);
  await cache.set(key, result, 'EX', CACHE_TTL_SECONDS);
}
