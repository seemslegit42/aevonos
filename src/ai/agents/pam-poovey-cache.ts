
import type { PamAudioOutput } from './pam-poovey-schemas';
import cache from '@/lib/cache';

const CACHE_TTL_SECONDS = 60 * 60; // 1 hour

const getCacheKey = (topic: string): string => {
  return `pam-poovey-rant:${topic}`;
}

export async function getCachedPamRant(topic: string): Promise<PamAudioOutput | null> {
  const key = getCacheKey(topic);
  const cachedData = await cache.get(key);
  if (cachedData) {
      console.log(`[Pam Poovey Cache] Cache hit for ${key}.`);
      return cachedData as PamAudioOutput;
  }
  return null;
}

export async function setCachedPamRant(topic: string, rant: PamAudioOutput): Promise<void> {
  const key = getCacheKey(topic);
  console.log(`[Pam Poovey Cache] Caching rant for ${key}.`);
  // Only cache if we actually have audio data, otherwise it's not a full result.
  if (rant.audioDataUri) {
      await cache.set(key, rant, 'EX', CACHE_TTL_SECONDS);
  }
}
