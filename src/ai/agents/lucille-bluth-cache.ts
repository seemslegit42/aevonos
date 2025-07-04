
import type { LucilleBluthOutput, LucilleBluthInput } from './lucille-bluth-schemas';
import cache from '@/lib/cache';

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

const getCacheKey = (input: Pick<LucilleBluthInput, 'expenseDescription' | 'expenseAmount' | 'category'>): string => {
  const desc = input.expenseDescription.toLowerCase().trim().replace(/\s+/g, '-');
  return `lucille-bluth-take:${desc}:${input.expenseAmount}:${input.category}`;
}

export async function getCachedLucilleTake(input: Pick<LucilleBluthInput, 'expenseDescription' | 'expenseAmount' | 'category'>): Promise<LucilleBluthOutput | null> {
  const key = getCacheKey(input);
  const cachedData = await cache.get(key);
  if (cachedData) {
      console.log(`[Lucille Cache] Cache hit for ${key}.`);
      return cachedData as LucilleBluthOutput;
  }
  return null;
}

export async function setCachedLucilleTake(input: Pick<LucilleBluthInput, 'expenseDescription' | 'expenseAmount' | 'category'>, take: LucilleBluthOutput): Promise<void> {
  const key = getCacheKey(input);
  console.log(`[Lucille Cache] Caching take for ${key}.`);
  await cache.set(key, take, 'EX', CACHE_TTL_SECONDS);
}
