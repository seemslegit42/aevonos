
'use server';

import prisma from '@/lib/prisma';
import type { ActiveSystemEffect } from '@prisma/client';

/**
 * Retrieves all active system effects for a given workspace.
 * @param workspaceId The ID of the workspace.
 * @returns A promise that resolves to an array of active effects.
 */
export async function getActiveEffectsForWorkspace(workspaceId: string): Promise<ActiveSystemEffect[]> {
  const now = new Date();
  // It's good practice to clean up expired effects periodically.
  // A cron job would be more efficient, but this is simple.
  await prisma.activeSystemEffect.deleteMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
  });

  return prisma.activeSystemEffect.findMany({
    where: {
      workspaceId: workspaceId,
      expiresAt: {
        gt: now,
      },
    },
  });
}

/**
 * Checks if a specific effect is active for a workspace.
 * @param workspaceId The ID of the workspace.
 * @param effectKey The key of the effect to check (e.g., 'ORACLES_DECREE').
 * @returns A promise that resolves to true if the effect is active, false otherwise.
 */
export async function isEffectActive(workspaceId: string, effectKey: string): Promise<boolean> {
  const activeEffects = await getActiveEffectsForWorkspace(workspaceId);
  return activeEffects.some(effect => effect.cardKey === effectKey);
}
