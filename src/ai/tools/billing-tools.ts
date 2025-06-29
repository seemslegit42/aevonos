
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
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';

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
    // This flow is now more complex, involving an AI call to Aegis.
    // It's a billable action.
    await incrementAgentActions(workspaceId);

    try {
      // Aegis Anomaly Scan
      const anomalyReport = await aegisAnomalyScan({
        activityDescription: `User initiated a credit top-up request of ${amount.toLocaleString()} ΞCredits.`,
        workspaceId,
      });

      if (anomalyReport.isAnomalous) {
        // If anomalous, create a security alert.
        await createSecurityAlertInDb({
          type: anomalyReport.anomalyType || 'Suspicious Transaction',
          explanation: `Aegis flagged a credit top-up request as anomalous. Reason: ${anomalyReport.anomalyExplanation}`,
          riskLevel: anomalyReport.riskLevel || 'medium',
        }, workspaceId);
      }

      // Still create the pending transaction regardless of the anomaly report.
      // The alert serves as a flag for the admin to review before confirming.
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

      let message = `Your request for ${amount.toLocaleString()} credits has been logged. Credits will be applied upon payment confirmation.`;
      if (anomalyReport.isAnomalous) {
        message += ' Note: This transaction has been flagged for administrative review due to unusual activity.';
      }

      return { success: true, message };
    } catch (e) {
      console.error('[Tool: requestCreditTopUp]', e);
      return { success: false, message: 'Failed to log your top-up request.' };
    }
  }
);

export async function requestCreditTopUpInDb(input: RequestCreditTopUpInput, userId: string, workspaceId: string): Promise<RequestCreditTopUpOutput> {
  return requestCreditTopUpFlow({ ...input, userId, workspaceId });
}
