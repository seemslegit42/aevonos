
'use server';
/**
 * @fileOverview Service for the Obelisk Pay Credit Ledger.
 * Provides atomic operations for all credit-based transactions.
 */

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, Transaction, TransactionStatus, TransactionType, UserPsyche } from '@prisma/client';
import { InsufficientCreditsError } from '@/lib/errors';
import { CreateManualTransactionInputSchema } from '@/ai/tools/ledger-schemas';
import { differenceInMinutes } from 'date-fns';

const CreateTransactionInputSchema = z.object({
  workspaceId: z.string(),
  type: z.nativeEnum(TransactionType),
  amount: z.number().positive('Transaction amount must be positive.'),
  description: z.string(),
  userId: z.string().optional(),
  agentId: z.string().optional(),
  instrumentId: z.string().optional(),
});
type CreateTransactionInput = z.infer<typeof CreateTransactionInputSchema>;


/**
 * Atomically creates a transaction and updates the workspace's credit balance.
 * This is the single source of truth for all credit modifications.
 * This is an internal function not meant to be called directly by agents.
 * @param input The transaction details.
 * @returns The newly created transaction record.
 */
async function createTransaction(input: CreateTransactionInput) {
    const { workspaceId, type, amount, description, userId, agentId, instrumentId } = CreateTransactionInputSchema.parse(input);

    try {
        const result = await prisma.$transaction(async (tx) => {
            if (type === TransactionType.DEBIT) {
                const workspace = await tx.workspace.findUnique({
                    where: { id: workspaceId },
                    select: { credits: true },
                });
                if (!workspace || (Number(workspace.credits)) < amount) {
                    throw new InsufficientCreditsError('Insufficient credits for this transaction.');
                }
            }

            // 1. Update the workspace's credit balance.
            await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    credits: {
                        [type === TransactionType.CREDIT ? 'increment' : 'decrement']: new Prisma.Decimal(amount),
                    },
                },
            });

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
        if (error instanceof InsufficientCreditsError) {
            throw error;
        }
        console.error(`[Ledger Service] Failed to create transaction for workspace ${workspaceId}:`, error);
        throw new Error('Transaction failed. The ledger remains unchanged.');
    }
}

/**
 * Creates a manual transaction as requested by a user through an agent.
 * This is an agent tool function.
 */
export async function createManualTransaction(
  input: z.infer<typeof CreateManualTransactionInputSchema>,
  workspaceId: string,
  userId: string
): Promise<Transaction> {
  // A manual transaction initiated by a user command shouldn't cost an extra agent action.
  // The "cost" is the transaction itself.
  return createTransaction({
    ...input,
    workspaceId,
    userId
  });
}

/**
 * Atomically processes a Micro-App purchase, handling credit debit, transaction
 * logging, and unlocking the app for the workspace.
 * @returns A promise that resolves upon successful completion.
 */
export async function processMicroAppPurchase(
  userId: string,
  workspaceId: string,
  appId: string,
  appName: string,
  creditCost: number
) {
  return prisma.$transaction(async (tx) => {
    // 1. Validate credits and ownership
    const workspace = await tx.workspace.findUnique({
      where: { id: workspaceId },
      select: { credits: true, unlockedAppIds: true },
    });

    if (!workspace) throw new Error('Workspace not found.');
    if (Number(workspace.credits) < creditCost) {
      throw new InsufficientCreditsError('Insufficient ΞCredits to acquire this Micro-App.');
    }
    if (workspace.unlockedAppIds.includes(appId)) {
      throw new Error('Micro-App already unlocked.');
    }

    // 2. Debit credits and unlock app atomically
    await tx.workspace.update({
      where: { id: workspaceId },
      data: {
        credits: { decrement: creditCost },
        unlockedAppIds: { push: appId },
      },
    });

    // 3. Create the transaction log
    await tx.transaction.create({
      data: {
        workspaceId,
        userId,
        type: TransactionType.DEBIT,
        amount: creditCost,
        description: `Micro-App Unlock: ${appName}`,
        instrumentId: appId,
        status: 'COMPLETED',
      },
    });

    // 4. Update instrument discovery log
    const discovery = await tx.instrumentDiscovery.findFirst({
      where: { userId, instrumentId: appId, converted: false },
    });

    if (discovery) {
      const dtt = differenceInMinutes(new Date(), discovery.firstViewedAt);
      await tx.instrumentDiscovery.update({
        where: { id: discovery.id },
        data: { converted: true, dtt: dtt > 0 ? dtt : 1 },
      });
    }
  });
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
 * This is an internal service function. It should be wrapped by a secure server action.
 * @param transactionId The ID of the transaction to confirm.
 * @param workspaceId The ID of the workspace, for an additional security check.
 * @returns The confirmed transaction record.
 */
export async function confirmPendingTransaction(transactionId: string, workspaceId: string): Promise<Transaction> {
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
}
