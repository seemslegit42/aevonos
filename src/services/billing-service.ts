
'use server';
/**
 * @fileOverview Service for handling billing and usage tracking.
 */
import prisma from '@/lib/prisma';
import { createTransaction } from './ledger-service';
import { TransactionType } from '@prisma/client';

/**
 * Atomically increments the agentActionsUsed counter for a given workspace
 * and creates a corresponding DEBIT transaction in the ledger.
 * @param workspaceId The ID of the workspace to update.
 * @param amount The number of actions to add. Defaults to 1.
 */
export async function incrementAgentActions(workspaceId: string, amount: number = 1): Promise<void> {
    if (!workspaceId) {
        console.warn("[Billing Service] Attempted to increment agent actions without a workspaceId. Skipping.");
        return;
    }
    try {
        // Step 1: Increment the simple usage counter.
        // This is not mission-critical if it fails, as the transaction is the source of truth.
        await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                agentActionsUsed: {
                    increment: amount,
                },
            },
        });

        // Step 2: Create the authoritative DEBIT transaction in the ledger.
        await createTransaction({
            workspaceId,
            type: TransactionType.DEBIT,
            amount: amount, // Assuming 1 action costs 1 credit for now.
            description: `Agent Action Cost (${amount}x)`,
        });

    } catch (error) {
        console.error(`[Billing Service] Failed to process agent action transaction for workspace ${workspaceId}:`, error);
        // We don't re-throw the error to avoid failing the entire agent flow
        // just because of a billing issue. We log it for monitoring.
    }
}
