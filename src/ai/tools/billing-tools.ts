
'use server';
/**
 * @fileOverview Tool for fetching billing and usage data.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { BillingUsageSchema, RequestCreditTopUpInputSchema, RequestCreditTopUpOutputSchema, type BillingUsage, type RequestCreditTopUpInput, type RequestCreditTopUpOutput } from './billing-schemas';
import prisma from '@/lib/prisma';
import { incrementAgentActions } from '@/services/billing-service';
import { TransactionStatus, TransactionType } from '@prisma/client';

const PLAN_LIMITS = {
  'Apprentice': 100,
  'Artisan': 2000,
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
    // Reading usage is also a billable agent action.
    // It's a query against the system on behalf of the user.
    await incrementAgentActions(workspaceId);
    
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


const requestCreditTopUpFlow = ai.defineFlow(
  {
    name: 'requestCreditTopUpFlow',
    inputSchema: RequestCreditTopUpInputSchema.extend({ userId: z.string(), workspaceId: z.string() }),
    outputSchema: RequestCreditTopUpOutputSchema,
  },
  async ({ amount, userId, workspaceId }) => {
    try {
      await prisma.transaction.create({
        data: {
          workspaceId,
          userId,
          type: TransactionType.CREDIT,
          status: TransactionStatus.PENDING,
          amount,
          description: `User-initiated e-Transfer top-up request for ${amount.toLocaleString()} credits.`,
        },
      });
      return { success: true, message: `Your request for ${amount.toLocaleString()} credits has been logged. Credits will be applied upon payment confirmation.` };
    } catch (e) {
      console.error('[Tool: requestCreditTopUp]', e);
      return { success: false, message: 'Failed to log your top-up request.' };
    }
  }
);

export async function requestCreditTopUpInDb(input: RequestCreditTopUpInput, userId: string, workspaceId: string): Promise<RequestCreditTopUpOutput> {
  return requestCreditTopUpFlow({ ...input, userId, workspaceId });
}
