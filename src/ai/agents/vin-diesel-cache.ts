
import type { VinDieselOutput } from './vin-diesel-schemas';

const CACHE_TTL_MINUTES = 10;

interface CachedVinValidation {
  result: VinDieselOutput;
  timestamp: number;
}

const vinCache: Record<string, CachedVinValidation> = {};

export function getCachedValidation(vin: string): VinDieselOutput | null {
  const key = vin.toUpperCase();
  const cached = vinCache[key];
  if (!cached) {
    return null;
  }

  const now = Date.now();
  const ageInMinutes = (now - cached.timestamp) / (1000 * 60);

  if (ageInMinutes > CACHE_TTL_MINUTES) {
    console.log(`[VIN Diesel Cache] Stale entry for ${key}. Ignoring.`);
    delete vinCache[key];
    return null;
  }

  console.log(`[VIN Diesel Cache] Cache hit for ${key}.`);
  return cached.result;
}

export function setCachedValidation(vin: string, result: VinDieselOutput): void {
  const key = vin.toUpperCase();
  console.log(`[VIN Diesel Cache] Caching result for ${key}.`);
  vinCache[key] = {
    result,
    timestamp: Date.now(),
  };
}
