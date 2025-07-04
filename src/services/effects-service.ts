
'use server';
/**
 * @fileOverview Service for managing active, temporary system-wide effects, such as those from Chaos Cards.
 */
import prisma from '@/lib/prisma';
import type { ActiveSystemEffect } from '@prisma/client';
import { artifactManifests } from '@/config/artifacts';
import { processEffectActivation } from './ledger-service';

/**
 * Activates a Chaos Card effect for a user.
 * This is now a simple controller that delegates the transactional logic
 * of debiting credits and applying the effect to the ledger service.
 * @param userId The ID of the user activating the card.
 * @param workspaceId The ID of the user's workspace.
 * @param cardId The ID of the Chaos Card to activate.
 */
export async function activateCardEffect(userId: string, workspaceId: string, cardId: string): Promise<void> {
  const cardManifest = artifactManifests.find(a => a.id === cardId && a.type === 'CHAOS_CARD');

  if (!cardManifest) {
    throw new Error(`Chaos Card with ID '${cardId}' not found.`);
  }

  // Delegate the entire transactional process to the ledger service.
  await processEffectActivation(userId, workspaceId, cardId, cardManifest.name, cardManifest.creditCost);
}


/**
 * Retrieves all active system effects for a given workspace.
 * It also automatically prunes any expired effects from the database.
 * @param workspaceId The ID of the workspace.
 * @returns A promise that resolves to an array of active effects.
 */
export async function getActiveEffectsForWorkspace(workspaceId: string): Promise<ActiveSystemEffect[]> {
  const now = new Date();
  // It's good practice to clean up expired effects periodically.
  // A cron job would be more efficient, but this is simple and effective.
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
