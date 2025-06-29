
'use server';
/**
 * @fileOverview Service for handling billing and usage tracking.
 */
import prisma from '@/lib/prisma';
import { Prisma, TransactionType, TransactionStatus } from '@prisma/client';
import { InsufficientCreditsError } from '@/lib/errors';

/**
 * Checks if a workspace can afford an action, then atomically decrements
 * the credit balance, increments the usage counter, and creates a DEBIT transaction.
 * Throws an InsufficientCreditsError if the balance is too low.
 * @param workspaceId The ID of the workspace to charge.
 * @param amount The number of credits the action costs. Defaults to 1.
 */
export async function authorizeAndDebitAgentActions(workspaceId: string, amount: number = 1): Promise<void> {
    if (!workspaceId) {
        console.warn("[Billing Service] Attempted to authorize agent actions without a workspaceId. Skipping.");
        return;
    }

    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get current credits for the check.
            // Note: In a high-concurrency environment, you might use `FOR UPDATE` in raw SQL
            // to lock the row, but Prisma's transaction isolation should be sufficient here.
            const workspace = await tx.workspace.findUnique({
                where: { id: workspaceId },
                select: { credits: true },
            });

            if (!workspace || (workspace.credits as unknown as number) < amount) {
                throw new InsufficientCreditsError(`Insufficient credits. Required: ${amount}, Available: ${workspace?.credits ?? 0}.`);
            }

            // 2. If check passes, perform the atomic updates.
            // Debit credits and increment usage counter.
            await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    credits: {
                        decrement: new Prisma.Decimal(amount),
                    },
                    agentActionsUsed: {
                        increment: amount,
                    },
                },
            });

            // 3. Create the transaction log entry.
            await tx.transaction.create({
                data: {
                    workspaceId,
                    type: TransactionType.DEBIT,
                    amount: new Prisma.Decimal(amount),
                    description: `Agent Action Cost (${amount}x)`,
                    status: TransactionStatus.COMPLETED,
                },
            });
        });
    } catch (error) {
        // Re-throw InsufficientCreditsError to be handled by the calling agent/UI
        if (error instanceof InsufficientCreditsError) {
            throw error;
        }
        // Log other errors but maybe throw a generic one
        console.error(`[Billing Service] Failed to process agent action debit for workspace ${workspaceId}:`, error);
        throw new Error('Failed to process agent action debit transaction.');
    }
}
