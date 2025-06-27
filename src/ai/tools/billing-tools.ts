
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

// This flow now requires a workspaceId to fetch the correct data.
const getUsageDetailsFlow = ai.defineFlow(
  {
    name: 'getUsageDetailsFlow',
    inputSchema: z.object({ workspaceId: z.string() }),
    outputSchema: BillingUsageSchema,
  },
  async ({ workspaceId }) => {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId }
    });

    if (!workspace) {
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

export async function getUsageDetails(workspaceId: string): Promise<BillingUsage> {
    return getUsageDetailsFlow({ workspaceId });
}
