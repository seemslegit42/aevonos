
'use server';

import type { StonksBotOutput, StonksBotMode } from './stonks-bot-schemas';
import cache from '@/lib/cache';

const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes for financial data

const getCacheKey = (ticker: string, mode: StonksBotMode): string => {
  return `stonks-advice:${ticker.toUpperCase()}:${mode}`;
}

export async function getCachedAdvice(ticker: string, mode: StonksBotMode): Promise<StonksBotOutput | null> {
  const key = getCacheKey(ticker, mode);
  const cachedData = await cache.get(key);
  if (cachedData) {
      console.log(`[Stonks Cache] Cache hit for ${key}.`);
      return cachedData as StonksBotOutput;
  }
  return null;
}

export async function setCachedAdvice(ticker: string, mode: StonksBotMode, advice: StonksBotOutput): Promise<void> {
  const key = getCacheKey(ticker, mode);
  console.log(`[Stonks Cache] Caching advice for ${key}.`);
  await cache.set(key, advice, 'EX', CACHE_TTL_SECONDS);
}
