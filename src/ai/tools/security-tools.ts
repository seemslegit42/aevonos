
'use server';
/**
 * @fileOverview Tool for creating security alerts.
 */
import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { z } from 'zod';
import { 
    CreateSecurityAlertInputSchema,
    SecurityAlertSchema,
    type CreateSecurityAlertInput, 
    type SecurityAlert, 
} from './security-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const EDICT_CACHE_KEY = (workspaceId: string) => `edicts:${workspaceId}`;
const EDICT_CACHE_TTL_SECONDS = 60 * 10; // 10 minutes

export async function createSecurityAlertInDb(input: CreateSecurityAlertInput, workspaceId: string, userId: string): Promise<SecurityAlert> {
    // Creating a security alert is a significant action.
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'TOOL_USE' });
    try {
      const { ...alertData } = input;
      const alert = await prisma.securityAlert.create({
        data: {
          ...alertData,
          actionableOptions: ['Lock Account', 'Dismiss Alert', 'View Details'],
          workspaceId,
          userId,
        },
      });
      return alert;
    } catch (error) {
      console.error('[Security Tool Error] Failed to create security alert:', error);
      throw new Error('Failed to create the security alert in the database.');
    }
}


export async function getSecurityEdicts(workspaceId: string): Promise<string[]> {
  const cacheKey = EDICT_CACHE_KEY(workspaceId);
  try {
    const cachedEdicts = await cache.get(cacheKey);
    if (cachedEdicts && Array.isArray(cachedEdicts)) {
        return cachedEdicts;
    }
    
    const edicts = await prisma.securityEdict.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
      select: {
        description: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    
    const descriptions = edicts.map((e) => e.description);
    await cache.set(cacheKey, descriptions, 'EX', EDICT_CACHE_TTL_SECONDS);

    return descriptions;
  } catch (error) {
    console.error(`[Security Tool Error] Failed to fetch security edicts for workspace ${workspaceId}:`, error);
    // Return empty array on failure so agent can proceed with caution
    return [];
  }
}
