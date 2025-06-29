'use server';
/**
 * @fileOverview Service for the Obelisk Pay Credit Ledger.
 * Provides atomic operations for all credit-based transactions.
 */

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, Transaction, TransactionStatus, TransactionType } from '@prisma/client';

export const CreateTransactionInputSchema = z.object({
  workspaceId: z.string(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Transaction amount must be positive.'),
  description: z.string(),
  userId: z.string().optional(),
  agentId: z.string().optional(),
});
export type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>;

/**
 * Atomically creates a transaction and updates the workspace's credit balance.
 * This is the single source of truth for all credit modifications.
 * @param input The transaction details.
 * @returns The newly created transaction record.
 */
export async function createTransaction(input: CreateTransactionInput) {
    const { workspaceId, type, amount, description, userId, agentId } = CreateTransactionInputSchema.parse(input);

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update the workspace's credit balance.
            const workspace = await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    credits: {
                        [type === TransactionType.CREDIT ? 'increment' : 'decrement']: new Prisma.Decimal(amount),
                    },
                },
            });

            // Optional: Check if the balance has gone negative and handle accordingly.
            if (workspace.credits < 0) {
                // For now, we'll just log it. In the future, this could trigger alerts or disable services.
                console.warn(`[Ledger Service] Workspace ${workspaceId} has a negative credit balance: ${workspace.credits}`);
            }

            // 2. Create the transaction log entry.
            const transaction = await tx.transaction.create({
                data: {
                    workspaceId,
                    type,
                    amount: new Prisma.Decimal(amount),
                    description,
                    userId,
                    agentId,
                    status: TransactionStatus.COMPLETED, // Direct transactions are always completed.
                },
            });
            
            return transaction;
        });

        return result;

    } catch (error) {
        console.error(`[Ledger Service] Failed to create transaction for workspace ${workspaceId}:`, error);
        // We re-throw the error so the calling service is aware of the failure.
        throw new Error('Transaction failed. The ledger remains unchanged.');
    }
}

/**
 * Retrieves the most recent transactions for a given workspace.
 * @param workspaceId The ID of the workspace.
 * @param limit The maximum number of transactions to return.
 * @returns A list of recent transaction records.
 */
export async function getWorkspaceTransactions(workspaceId: string, limit = 20) {
  if (!workspaceId) {
    throw new Error('Workspace ID is required to fetch transactions.');
  }

  return prisma.transaction.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}


/**
 * Atomically confirms a pending credit transaction, updating its status
 * and applying the credit amount to the workspace's balance.
 * @param transactionId The ID of the transaction to confirm.
 * @param workspaceId The ID of the workspace, for an additional security check.
 * @returns The confirmed transaction record.
 */
export async function confirmPendingTransaction(transactionId: string, workspaceId: string): Promise<Transaction> {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find the pending transaction to ensure it exists and is pending for the correct workspace.
            const pendingTx = await tx.transaction.findFirst({
                where: { 
                    id: transactionId,
                    workspaceId: workspaceId,
                    status: TransactionStatus.PENDING 
                },
            });

            if (!pendingTx) {
                throw new Error('Pending transaction not found or already processed.');
            }
            if (pendingTx.type !== TransactionType.CREDIT) {
                throw new Error('Can only confirm credit transactions.');
            }

            // 2. Atomically update the workspace's credit balance.
            await tx.workspace.update({
                where: { id: pendingTx.workspaceId },
                data: {
                    credits: {
                        increment: pendingTx.amount,
                    },
                },
            });

            // 3. Update the transaction status to COMPLETED.
            const confirmedTx = await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    status: TransactionStatus.COMPLETED,
                },
            });

            return confirmedTx;
        });

        return result;
    } catch (error) {
        console.error(`[Ledger Service] Failed to confirm transaction ${transactionId}:`, error);
        throw new Error(error instanceof Error ? error.message : 'Transaction confirmation failed.');
    }
}
