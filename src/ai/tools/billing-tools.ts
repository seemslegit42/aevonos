
'use server';
/**
 * @fileOverview Tool for fetching billing and usage data.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { BillingUsageSchema, type BillingUsage } from './billing-schemas';
import prisma from '@/lib/prisma';

const PLAN_LIMITS = {
  'Apprentice': 100,
  'Artisan': 10000,
  'Priesthood': 100000,
} as const;

// This function now requires a workspaceId to fetch the correct data.
const getUsageDetailsFlow = ai.defineFlow(
  {
    name: 'getUsageDetailsFlow',
    inputSchema: z.object({ workspaceId: z.string() }),
    outputSchema: BillingUsageSchema,
  },
  async ({ workspaceId }) => {
    let workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId }
    });

    if (!workspace) {
        // This should not happen in a real authenticated flow, but it's good practice to handle it.
        throw new Error(`Workspace with ID ${workspaceId} not found.`);
    }
    
    const planTier = workspace.planTier as keyof typeof PLAN_LIMITS;
    const planLimit = PLAN_LIMITS[planTier] || 0;

    return {
      currentPeriod: new Date().toISOString().split('T')[0],
      totalActionsUsed: workspace.agentActionsUsed,
      planLimit: planLimit,
      planTier: workspace.planTier,
      overageEnabled: workspace.overageEnabled,
    };
  }
);

// The exported function's signature must change if it needs workspaceId.
// For now, BEEP doesn't pass this, so we'll keep the public signature but it will only work for the first workspace.
// This highlights the need to pass context into the agent graph.
export async function getUsageDetails(): Promise<BillingUsage> {
    const firstWorkspace = await prisma.workspace.findFirst();
    if (!firstWorkspace) {
        // Seed a default workspace if none exists.
        const defaultUser = await prisma.user.create({
            data: { email: 'default-user@aevonos.com' }
        });
        const seededWorkspace = await prisma.workspace.create({
            data: {
                name: 'Default Workspace',
                planTier: 'Artisan',
                agentActionsUsed: 7531,
                overageEnabled: true,
                ownerId: defaultUser.id,
            }
        });
        return getUsageDetailsFlow({ workspaceId: seededWorkspace.id });
    }
    return getUsageDetailsFlow({ workspaceId: firstWorkspace.id });
}
