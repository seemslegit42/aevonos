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

// This is a functional implementation that queries and seeds the database.
const getUsageDetailsFlow = ai.defineFlow(
  {
    name: 'getUsageDetailsFlow',
    inputSchema: z.void(),
    outputSchema: BillingUsageSchema,
  },
  async () => {
    // In a real multi-tenant app, you'd get the workspace ID from the user's session.
    // For this environment, we'll find the first workspace or create a default one.
    let workspace = await (prisma as any).workspace.findFirst();

    if (!workspace) {
        // Seed a default workspace if none exists.
        workspace = await (prisma as any).workspace.create({
            data: {
                name: 'Default Workspace',
                planTier: 'Artisan',
                agentActionsUsed: 7531, // Set to match example from api-spec.md
                overageEnabled: true,
            }
        });
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

export async function getUsageDetails(): Promise<BillingUsage> {
    return getUsageDetailsFlow();
}
