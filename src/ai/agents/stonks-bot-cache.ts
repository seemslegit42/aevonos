
import type { StonksBotOutput, StonksBotMode } from './stonks-bot-schemas';

const CACHE_TTL_MINUTES = 5;

interface CachedStonksAdvice {
  advice: StonksBotOutput;
  timestamp: number;
}

const stonksCache: Record<string, CachedStonksAdvice> = {};

function getCacheKey(ticker: string, mode: StonksBotMode): string {
  return `${ticker.toUpperCase()}:${mode}`;
}

export async function getCachedAdvice(ticker: string, mode: StonksBotMode): Promise<StonksBotOutput | null> {
  const key = getCacheKey(ticker, mode);
  const cached = stonksCache[key];
  if (!cached) {
    return null;
  }

  const now = Date.now();
  const ageInMinutes = (now - cached.timestamp) / (1000 * 60);

  if (ageInMinutes > CACHE_TTL_MINUTES) {
    console.log(`[Stonks Cache] Stale entry for ${key}. Ignoring.`);
    delete stonksCache[key];
    return null;
  }

  console.log(`[Stonks Cache] Cache hit for ${key}.`);
  return cached.advice;
}

export async function setCachedAdvice(ticker: string, mode: StonksBotMode, advice: StonksBotOutput): Promise<void> {
  const key = getCacheKey(ticker, mode);
  console.log(`[Stonks Cache] Caching advice for ${key}.`);
  stonksCache[key] = {
    advice,
    timestamp: Date.now(),
  };
}
