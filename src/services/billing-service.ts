
'use server';
/**
 * @fileOverview Service for handling billing and usage tracking.
 */
import prisma from '@/lib/prisma';
import { Prisma, TransactionStatus, TransactionType, PlanTier } from '@prisma/client';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { createSecurityAlertInDb } from '@/ai/tools/security-tools';
import { PLAN_LIMITS } from '@/config/billing';
import { InsufficientCreditsError } from '@/lib/errors';
import type { BillingUsage, RequestCreditTopUpInput, RequestCreditTopUpOutput } from '@/ai/tools/billing-schemas';
import { z } from 'zod';

export const ActionTypeSchema = z.enum([
    'SIMPLE_LLM',
    'COMPLEX_LLM',
    'IMAGE_GENERATION',
    'TTS_GENERATION',
    'TOOL_USE',
    'EXTERNAL_API'
]);
export type ActionType = z.infer<typeof ActionTypeSchema>;

const ActionCostRegistry: Record<ActionType, number> = {
    SIMPLE_LLM: 1,
    COMPLEX_LLM: 2,
    IMAGE_GENERATION: 5,
    TTS_GENERATION: 1,
    TOOL_USE: 1,
    EXTERNAL_API: 2,
};

export const AuthorizeAndDebitInputSchema = z.object({
  workspaceId: z.string(),
  userId: z.string().optional(),
  actionType: ActionTypeSchema,
  costMultiplier: z.number().optional().default(1),
  context: z.record(z.any()).optional(), // Not used for now, but part of spec
});
type AuthorizeAndDebitInput = z.infer<typeof AuthorizeAndDebitInputSchema>;

export const AuthorizeAndDebitOutputSchema = z.object({
  success: z.boolean(),
  remainingBalance: z.number(),
  debitAmount: z.number(),
  message: z.string(),
});
export type AuthorizeAndDebitOutput = z.infer<typeof AuthorizeAndDebitOutputSchema>;


/**
 * Checks if a workspace can afford an action, then atomically decrements
 * the credit balance, increments the usage counter, and creates a DEBIT transaction.
 * This now respects the monthly plan limits before charging for overage.
 * It also respects the user-specific Reclamation Grace Period.
 */
export async function authorizeAndDebitAgentActions(input: AuthorizeAndDebitInput): Promise<AuthorizeAndDebitOutput> {
    const { workspaceId, userId, actionType, costMultiplier } = AuthorizeAndDebitInputSchema.parse(input);

    if (!workspaceId) {
        throw new Error("[Billing Service] Attempted to authorize agent actions without a workspaceId.");
    }
    
    const baseCost = ActionCostRegistry[actionType];
    let cost = Math.ceil(baseCost * (costMultiplier || 1));

    try {
        // If a userId is provided, first check for the reclamation grace period.
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { reclamationGraceUntil: true },
            });
            // If user is in grace period, skip the entire transaction.
            if (user?.reclamationGraceUntil && new Date() < user.reclamationGraceUntil) {
                console.log(`[Billing Service] User ${userId} is in reclamation grace period. Skipping debit.`);
                const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { credits: true } });
                return { success: true, remainingBalance: Number(workspace?.credits || 0), debitAmount: 0, message: "Action covered by Reclamation Grace Period." };
            }
        }
        
        const { remainingBalance, debitAmount, message } = await prisma.$transaction(async (tx) => {
            // 1. Get workspace and its plan details.
            const workspace = await tx.workspace.findUnique({
                where: { id: workspaceId },
                select: { credits: true, agentActionsUsed: true, planTier: true },
            });

            if (!workspace) {
                throw new Error(`Workspace with ID ${workspaceId} not found.`);
            }

            const planTier = workspace.planTier as keyof typeof PLAN_LIMITS;
            const planLimit = PLAN_LIMITS[planTier] || 0;
            
            // 2. Check if the user is still within their monthly included actions.
            if (workspace.agentActionsUsed < planLimit) {
                const remainingFreeActions = planLimit - workspace.agentActionsUsed;
                const actionsCoveredByPlan = Math.min(cost, remainingFreeActions);

                // Increment usage counter for the actions covered by the plan.
                if (actionsCoveredByPlan > 0) {
                    await tx.workspace.update({
                        where: { id: workspaceId },
                        data: { agentActionsUsed: { increment: actionsCoveredByPlan } },
                    });
                }

                const remainingAmountToDebit = cost - actionsCoveredByPlan;

                if (remainingAmountToDebit <= 0) {
                    // All actions were covered by the plan, no credit charge needed.
                    return { remainingBalance: Number(workspace.credits), debitAmount: 0, message: `Action successful. ${actionsCoveredByPlan} free action(s) used.` };
                }
                
                // If some actions are overage, fall through to debit credits for the remainder.
                cost = remainingAmountToDebit;
            }

            // 3. If in overage (or partially in overage), check credit balance and debit.
            const currentCredits = Number(workspace.credits);
            if (currentCredits < cost) {
                throw new InsufficientCreditsError(`Insufficient credits for overage. Required: ${cost}, Available: ${currentCredits ?? 0}.`);
            }

            // 4. Atomically update credits and usage, and log the transaction.
            const updatedWorkspace = await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    credits: {
                        decrement: new Prisma.Decimal(cost),
                    },
                    agentActionsUsed: {
                        increment: cost, // Also increment for overage actions
                    },
                },
            });

            await tx.transaction.create({
                data: {
                    workspaceId,
                    userId, // Log which user triggered the debit
                    type: TransactionType.DEBIT,
                    amount: new Prisma.Decimal(cost),
                    description: `Agent Action: ${actionType} (x${costMultiplier || 1})`,
                    status: TransactionStatus.COMPLETED,
                },
            });

            return { remainingBalance: Number(updatedWorkspace.credits), debitAmount: cost, message: `Action successful. ${cost} credits debited.` };
        });

        return { success: true, remainingBalance, debitAmount, message };
    } catch (error) {
        if (error instanceof InsufficientCreditsError) {
            throw error;
        }
        console.error(`[Billing Service] Failed to process agent action debit for workspace ${workspaceId}:`, error);
        throw new Error('An internal error occurred during billing.');
    }
}


/**
 * Retrieves the usage details for a given workspace for UI display.
 * This is NOT a billable agent action.
 * @param workspaceId The ID of the workspace.
 * @returns The billing usage details.
 */
export async function getUsageDetails(workspaceId: string): Promise<BillingUsage> {
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

/**
 * Retrieves the usage details for a given workspace via an agent tool.
 * This IS a billable agent action.
 * @param workspaceId The ID of the workspace.
 * @param userId The ID of the user triggering the tool.
 * @returns The billing usage details.
 */
export async function getUsageDetailsForAgent(workspaceId: string, userId: string): Promise<BillingUsage> {
  // Reading usage data via an agent is a billable action.
  await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'TOOL_USE' });
  return getUsageDetails(workspaceId);
}


/**
 * Logs a user's request to top up their credit balance.
 * This is a service function called by the UI (via server action) and agent tools.
 * @param input The top-up request details.
 * @param userId The ID of the user making the request.
 * @param workspaceId The ID of the workspace.
 * @returns A confirmation message.
 */
export async function requestCreditTopUpInDb(input: RequestCreditTopUpInput, userId: string, workspaceId: string): Promise<RequestCreditTopUpOutput> {
  const { amount } = input;
  // This is a free action for the user, but we can still run a security check.
  try {
    const anomalyReport = await aegisAnomalyScan({
      activityDescription: `User initiated a credit top-up request of ${amount.toLocaleString()} ΞCredits.`,
      workspaceId,
      userId,
    });

    if (anomalyReport.isAnomalous) {
      await createSecurityAlertInDb({
        type: anomalyReport.anomalyType || 'Suspicious Transaction',
        explanation: `Aegis flagged a credit top-up request as anomalous. Reason: ${anomalyReport.anomalyExplanation}`,
        riskLevel: anomalyReport.riskLevel || 'medium',
      }, workspaceId, userId);
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
    console.error('[Service: requestCreditTopUpInDb]', e);
    return { success: false, message: 'Failed to log your top-up request.' };
  }
}
