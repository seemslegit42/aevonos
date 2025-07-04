
import type { JrocOutput, JrocInput } from './jroc-schemas';
import cache from '@/lib/cache';

const CACHE_TTL_SECONDS = 15 * 60; // 15 minutes

const getCacheKey = (input: Pick<JrocInput, 'businessType' | 'logoStyle'>): string => {
  const type = input.businessType.toLowerCase().trim().replace(/\s+/g, '-');
  const style = input.logoStyle;
  return `jroc-kit:${type}:${style}`;
}

export async function getCachedBusinessKit(input: Pick<JrocInput, 'businessType' | 'logoStyle'>): Promise<JrocOutput | null> {
  const key = getCacheKey(input);
  const cachedData = await cache.get(key);
  if (cachedData) {
      console.log(`[J-ROC Cache] Cache hit for ${key}.`);
      return cachedData as JrocOutput;
  }
  return null;
}

export async function setCachedBusinessKit(input: Pick<JrocInput, 'businessType' | 'logoStyle'>, kit: JrocOutput): Promise<void> {
  const key = getCacheKey(input);
  console.log(`[J-ROC Cache] Caching kit for ${key}.`);
  await cache.set(key, kit, 'EX', CACHE_TTL_SECONDS);
}
