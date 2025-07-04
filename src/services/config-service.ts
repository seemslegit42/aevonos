
'use server';

import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import type { PulseEngineConfig } from '@prisma/client';

const CONFIG_CACHE_KEY = (workspaceId: string) => `config:pulse-engine:${workspaceId}`;
const CONFIG_CACHE_TTL_SECONDS = 60 * 5; // 5 minutes

/**
 * Retrieves the Pulse Engine configuration for a workspace, using a cache-aside strategy.
 * Creates a default config if one doesn't exist.
 * @param workspaceId The ID of the workspace.
 * @returns The PulseEngineConfig for the workspace.
 */
export async function getPulseEngineConfig(workspaceId: string): Promise<PulseEngineConfig> {
  const cacheKey = CONFIG_CACHE_KEY(workspaceId);
  const cachedConfig = await cache.get(cacheKey);

  if (cachedConfig) {
    // Prisma Decimal gets stringified, so we need to convert it back
    return { ...cachedConfig, transmutationTithe: new (require('decimal.js'))(cachedConfig.transmutationTithe) };
  }

  let config = await prisma.pulseEngineConfig.findUnique({
    where: { workspaceId },
  });

  if (!config) {
    console.log(`[Config Service] No config found for workspace ${workspaceId}. Creating default.`);
    config = await prisma.pulseEngineConfig.create({
      data: {
        workspaceId,
      },
    });
  }

  await cache.set(cacheKey, config, 'EX', CONFIG_CACHE_TTL_SECONDS);

  return config;
}

/**
 * Updates the Pulse Engine configuration for a workspace and invalidates the cache.
 * @param workspaceId The ID of the workspace.
 * @param data The partial data to update.
 * @returns The updated PulseEngineConfig.
 */
export async function updatePulseEngineConfig(workspaceId: string, data: Partial<PulseEngineConfig>): Promise<PulseEngineConfig> {
  const updatedConfig = await prisma.pulseEngineConfig.update({
    where: { workspaceId },
    data,
  });

  const cacheKey = CONFIG_CACHE_KEY(workspaceId);
  await cache.del(cacheKey);

  return updatedConfig;
}
