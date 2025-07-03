import type { JrocOutput, JrocInput } from './jroc-schemas';

const CACHE_TTL_MINUTES = 15;

interface CachedBusinessKit {
  kit: JrocOutput;
  timestamp: number;
}

const jrocCache: Record<string, CachedBusinessKit> = {};

function getCacheKey(input: Pick<JrocInput, 'businessType' | 'logoStyle'>): string {
  // Normalize and create a stable key
  const type = input.businessType.toLowerCase().trim().replace(/\s+/g, '-');
  const style = input.logoStyle;
  return `${type}:${style}`;
}

export async function getCachedBusinessKit(input: Pick<JrocInput, 'businessType' | 'logoStyle'>): Promise<JrocOutput | null> {
  const key = getCacheKey(input);
  const cached = jrocCache[key];
  if (!cached) {
    return null;
  }

  const now = Date.now();
  const ageInMinutes = (now - cached.timestamp) / (1000 * 60);

  if (ageInMinutes > CACHE_TTL_MINUTES) {
    console.log(`[J-ROC Cache] Stale entry for ${key}. Re-generating.`);
    delete jrocCache[key];
    return null;
  }

  console.log(`[J-ROC Cache] Cache hit for ${key}.`);
  return cached.kit;
}

export async function setCachedBusinessKit(input: Pick<JrocInput, 'businessType' | 'logoStyle'>, kit: JrocOutput): Promise<void> {
  const key = getCacheKey(input);
  console.log(`[J-ROC Cache] Caching kit for ${key}.`);
  jrocCache[key] = {
    kit,
    timestamp: Date.now(),
  };
}
