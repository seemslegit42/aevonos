
'use server';
/**
 * @fileOverview Service for handling billing and usage tracking.
 */
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { BillingUsageSchema, RequestCreditTopUpInputSchema, RequestCreditTopUpOutputSchema, type BillingUsage, type RequestCreditTopUpInput, type RequestCreditTopUpOutput } from '@/ai/tools/billing-schemas';
import prisma from '@/lib/prisma';
import { TransactionStatus, TransactionType } from '@prisma/client';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';
import { PLAN_LIMITS } from '@/config/billing';
import { InsufficientCreditsError } from '@/lib/errors';
import { Prisma } from '@prisma/client';

/**
 * Checks if a workspace can afford an action, then atomically decrements
 * the credit balance, increments the usage counter, and creates a DEBIT transaction.
 * This now respects the monthly plan limits before charging for overage.
 * @param workspaceId The ID of the workspace to charge.
 * @param amount The number of agent actions to authorize. Defaults to 1.
 */
export async function authorizeAndDebitAgentActions(workspaceId: string, amount: number = 1): Promise<void> {
    if (!workspaceId) {
        console.warn("[Billing Service] Attempted to authorize agent actions without a workspaceId. Skipping.");
        return;
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get workspace and its plan details.
            const workspace = await tx.workspace.findUnique({
                where: { id: workspaceId },
                select: { credits: true, agentActionsUsed: true, planTier: true, reclamationGraceUntil: true },
            });

            if (!workspace) {
                throw new Error(`Workspace with ID ${workspaceId} not found.`);
            }

            // Check for reclamation grace period
            if (workspace.reclamationGraceUntil && new Date() < workspace.reclamationGraceUntil) {
                console.log(`[Billing Service] Workspace ${workspaceId} is in reclamation grace period. Skipping debit.`);
                return; // User is in grace period, no charge.
            }

            const planTier = workspace.planTier as keyof typeof PLAN_LIMITS;
            const planLimit = PLAN_LIMITS[planTier] || 0;
            
            // 2. Check if the user is still within their monthly included actions.
            if (workspace.agentActionsUsed < planLimit) {
                const remainingFreeActions = planLimit - workspace.agentActionsUsed;
                const actionsCoveredByPlan = Math.min(amount, remainingFreeActions);

                // Increment usage counter for the actions covered by the plan.
                if (actionsCoveredByPlan > 0) {
                    await tx.workspace.update({
                        where: { id: workspaceId },
                        data: { agentActionsUsed: { increment: actionsCoveredByPlan } },
                    });
                }

                const remainingAmountToDebit = amount - actionsCoveredByPlan;

                if (remainingAmountToDebit <= 0) {
                    // All actions were covered by the plan, no credit charge needed.
                    return; 
                }
                
                // If some actions are overage, fall through to debit credits for the remainder.
                amount = remainingAmountToDebit;
            }

            // 3. If in overage (or partially in overage), check credit balance and debit.
            const currentCredits = (workspace.credits as unknown as number);
            if (currentCredits < amount) {
                throw new InsufficientCreditsError(`Insufficient credits for overage. Required: ${amount}, Available: ${currentCredits ?? 0}.`);
            }

            // 4. Atomically update credits and usage, and log the transaction.
            await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    credits: {
                        decrement: new Prisma.Decimal(amount),
                    },
                    agentActionsUsed: {
                        increment: amount, // Also increment for overage actions
                    },
                },
            });

            await tx.transaction.create({
                data: {
                    workspaceId,
                    type: TransactionType.DEBIT,
                    amount: new Prisma.Decimal(amount),
                    description: `Agent Action Overage Cost (${amount}x)`,
                    status: TransactionStatus.COMPLETED,
                },
            });
        });
    } catch (error) {
        if (error instanceof InsufficientCreditsError) {
            throw error;
        }
        console.error(`[Billing Service] Failed to process agent action debit for workspace ${workspaceId}:`, error);
        throw new Error('Failed to process agent action debit transaction.');
    }
}


// This flow now requires a workspaceId to fetch the correct data.
const getUsageDetailsFlow = ai.defineFlow(
  {
    name: 'getUsageDetailsFlow',
    inputSchema: z.object({ workspaceId: z.string() }),
    outputSchema: BillingUsageSchema,
  },
  async ({ workspaceId }) => {
    // This is an agent action and should be billed.
    await authorizeAndDebitAgentActions(workspaceId);
    
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
    // This is a free action for the user, but we can still run a security check.
    // It is not billed as it facilitates revenue.
    try {
      const anomalyReport = await aegisAnomalyScan({
        activityDescription: `User initiated a credit top-up request of ${amount.toLocaleString()} ΞCredits.`,
        workspaceId,
      });

      if (anomalyReport.isAnomalous) {
        await createSecurityAlertInDb({
          type: anomalyReport.anomalyType || 'Suspicious Transaction',
          explanation: `Aegis flagged a credit top-up request as anomalous. Reason: ${anomalyReport.anomalyExplanation}`,
          riskLevel: anomalyReport.riskLevel || 'medium',
        }, workspaceId);
      }

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
