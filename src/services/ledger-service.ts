'use server';
/**
 * @fileOverview Service for the Obelisk Pay Credit Ledger.
 * Provides atomic operations for all credit-based transactions.
 */

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, Transaction, TransactionStatus, TransactionType, UserPsyche } from '@prisma/client';
import { InsufficientCreditsError } from '@/lib/errors';

export const CreateTransactionInputSchema = z.object({
  workspaceId: z.string(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Transaction amount must be positive.'),
  description: z.string(),
  userId: z.string().optional(),
  agentId: z.string().optional(),
  instrumentId: z.string().optional(),
});
export type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>;

/**
 * Atomically creates a transaction and updates the workspace's credit balance.
 * This is the single source of truth for all credit modifications.
 * @param input The transaction details.
 * @returns The newly created transaction record.
 */
export async function createTransaction(input: CreateTransactionInput) {
    const { workspaceId, type, amount, description, userId, agentId, instrumentId } = CreateTransactionInputSchema.parse(input);

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

            if ((workspace.credits as unknown as number) < 0) {
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
                    instrumentId,
                    status: TransactionStatus.COMPLETED,
                },
            });
            
            return transaction;
        });

        return result;

    } catch (error) {
        console.error(`[Ledger Service] Failed to create transaction for workspace ${workspaceId}:`, error);
        throw new Error('Transaction failed. The ledger remains unchanged.');
    }
}


export const LogTributeEventInputSchema = z.object({
    workspaceId: z.string(),
    userId: z.string(),
    instrumentId: z.string(),
    tributeAmount: z.number(),
    luckWeight: z.number(),
    outcome: z.string(),
    boonAmount: z.number(),
    userPsyche: z.nativeEnum(UserPsyche),
});
export type LogTributeEventInput = z.infer<typeof LogTributeEventInputSchema>;

/**
 * Atomically logs a tribute event, updating the workspace balance and creating a single, immutable transaction record.
 * @param input The details of the tribute event.
 * @returns The newly created transaction log.
 */
export async function logTributeEvent(input: LogTributeEventInput) {
    const { workspaceId, userId, instrumentId, tributeAmount, luckWeight, outcome, boonAmount, userPsyche } = LogTributeEventInputSchema.parse(input);

    const netAmount = boonAmount - tributeAmount;

    try {
        const tributeLog = await prisma.$transaction(async (tx) => {
            // 1. Atomically update the workspace's credit balance with the net result.
            const workspace = await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    credits: {
                        increment: new Prisma.Decimal(netAmount),
                    },
                },
            });

            if ((workspace.credits as unknown as number) < 0) {
                console.warn(`[Ledger Service] Workspace ${workspaceId} has gone into negative balance following a tribute.`);
            }

            // 2. Create the single, immutable TributeLog entry.
            return await tx.transaction.create({
                data: {
                    workspaceId,
                    userId,
                    type: TransactionType.TRIBUTE,
                    amount: new Prisma.Decimal(netAmount), // Net change in credits
                    description: `Folly: ${instrumentId} - ${outcome}`,
                    instrumentId,
                    luckWeight,
                    outcome,
                    boonAmount: new Prisma.Decimal(boonAmount),
                    userPsyche,
                    status: TransactionStatus.COMPLETED,
                },
            });
        });

        return tributeLog;
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            throw new InsufficientCreditsError('Could not process tribute. Insufficient credits.');
        }
        console.error(`[Ledger Service] Failed to log tribute for workspace ${workspaceId}:`, error);
        throw new Error('Tribute event failed. The ledger remains unchanged.');
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

            await tx.workspace.update({
                where: { id: pendingTx.workspaceId },
                data: {
                    credits: {
                        increment: pendingTx.amount,
                    },
                },
            });

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
