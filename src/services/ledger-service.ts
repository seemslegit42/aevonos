
'use server';
/**
 * @fileOverview Service for the Obelisk Pay Credit Ledger.
 * Provides atomic operations for all credit-based transactions.
 */

import prisma from '@/lib/prisma';
import cache from '@/lib/cache';
import { z } from 'zod';
import { Prisma, Transaction, TransactionStatus, TransactionType } from '@prisma/client';
import { InsufficientCreditsError } from '@/lib/errors';
import { CreateManualTransactionInputSchema, TransmuteCreditsInputSchema, type TransmuteCreditsOutput } from '@/ai/tools/ledger-schemas';
import { differenceInMinutes } from 'date-fns';
import { artifactManifests } from '@/config/artifacts';
import { createHmac } from 'crypto';
import { getPulseEngineConfig } from './config-service';

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

const XI_TO_CAD_EXCHANGE_RATE = 0.00025; // 1 CAD = 4000 Xi, placeholder. A real system would use a dynamic rate.


/**
 * Atomically creates a transaction and updates the workspace's credit balance.
 * This is the single source of truth for all credit modifications.
 * This is an internal function not meant to be called directly by agents.
 * @param input The transaction details.
 * @returns The newly created transaction record.
 */
async function createTransaction(input: CreateTransactionInput) {
    const { workspaceId, type, amount, description, userId, agentId, instrumentId } = CreateTransactionInputSchema.parse(input);
    const signatureSecret = process.env.AEGIS_SIGNING_SECRET || 'default_secret_for_dev';

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
            
            await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    credits: {
                        [type === TransactionType.CREDIT ? 'increment' : 'decrement']: new Prisma.Decimal(amount),
                    },
                },
            });

            const transactionDataForSigning = {
                workspaceId, type,
                amount: new Prisma.Decimal(amount).toFixed(8),
                description,
                timestamp: new Date().toISOString(),
                userId, agentId, instrumentId
            };
            const signature = createHmac('sha256', signatureSecret)
                .update(JSON.stringify(transactionDataForSigning))
                .digest('hex');

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
                    aegisSignature: signature,
                },
            });
            
            return transaction;
        });
        
        if (userId) {
            await cache.del(`workspace:user:${userId}`);
        }

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
  const signatureSecret = process.env.AEGIS_SIGNING_SECRET || 'default_secret_for_dev';

  await prisma.$transaction(async (tx) => {
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
    
    const description = `Micro-App Unlock: ${appName}`;
    const transactionDataForSigning = {
        workspaceId, userId, instrumentId: appId,
        type: TransactionType.DEBIT,
        amount: new Prisma.Decimal(creditCost).toFixed(8),
        description,
        timestamp: new Date().toISOString()
    };
    const signature = createHmac('sha256', signatureSecret)
        .update(JSON.stringify(transactionDataForSigning))
        .digest('hex');

    // 3. Create the transaction log
    await tx.transaction.create({
      data: {
        workspaceId,
        userId,
        type: TransactionType.DEBIT,
        amount: creditCost,
        description,
        instrumentId: appId,
        status: 'COMPLETED',
        aegisSignature: signature,
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

  // Invalidate workspace cache after the transaction
  await cache.del(`workspace:user:${userId}`);
}

/**
 * Retrieves the most recent transactions for a given workspace.
 * @param workspaceId The ID of the workspace.
 * @param limit The maximum number of transactions to return.
 * @returns A list of recent transaction records.
 */
export async function getWorkspaceTransactions(workspaceId: string, limit = 20): Promise<Transaction[]> {
  if (!workspaceId) {
    throw new Error('Workspace ID is required to fetch transactions.');
  }

  const txs = await prisma.transaction.findMany({
    where: { workspaceId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return txs.map(tx => ({ ...tx, amount: Number(tx.amount) }));
}

/**
 * Retrieves the most recent transactions for a given user.
 * @param userId The ID of the user.
 * @param workspaceId The ID of the workspace for scoping.
 * @param limit The maximum number of transactions to return.
 * @returns A list of recent transaction records for the user.
 */
export async function getRecentTransactionsForUser(userId: string, workspaceId: string, limit = 5): Promise<Transaction[]> {
  if (!userId || !workspaceId) {
    throw new Error('User ID and Workspace ID are required.');
  }
  const txs = await prisma.transaction.findMany({
    where: {
      userId,
      workspaceId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
  return txs.map(tx => ({ ...tx, amount: Number(tx.amount) }));
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

    // Invalidate workspace cache on confirmation
    if (result.userId) {
        await cache.del(`workspace:user:${result.userId}`);
    }


    return { ...result, amount: Number(result.amount) };
}

/**
 * Calculates the cost of a real-world transmutation.
 * @returns An object with the cost breakdown.
 */
export async function getTransmutationQuote(
  input: Omit<z.infer<typeof TransmuteCreditsInputSchema>, 'vendor'>,
  workspaceId: string
) {
    const config = await getPulseEngineConfig(workspaceId);
    const transmutationTitheRate = Number(config.transmutationTithe);
    
    const costInX = Math.ceil(input.amount / XI_TO_CAD_EXCHANGE_RATE);
    const tithe = Math.ceil(costInX * transmutationTitheRate);
    const total = costInX + tithe;

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { credits: true },
    });
    
    const isSufficient = workspace && Number(workspace.credits) >= total;

    return {
        realWorldAmount: input.amount,
        currency: input.currency,
        costInX,
        tithe,
        total,
        isSufficient
    };
}


/**
 * Atomically processes a real-world payment tribute via the Proxy.Agent.
 * @param input The details of the transmutation.
 * @param workspaceId The user's workspace.
 * @param userId The user initiating the transmutation.
 * @returns A confirmation result.
 */
export async function transmuteCredits(
  input: z.infer<typeof TransmuteCreditsInputSchema>,
  workspaceId: string,
  userId: string
): Promise<TransmuteCreditsOutput> {
  const { amount, vendor, currency } = TransmuteCreditsInputSchema.parse(input);
  const signatureSecret = process.env.AEGIS_SIGNING_SECRET || 'default_secret_for_dev';
  
  const quote = await getTransmutationQuote({ amount, currency }, workspaceId);

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (!quote.isSufficient) {
        throw new InsufficientCreditsError(`Insufficient ΞCredits to transmute. Required: ${quote.total.toLocaleString()}, have: ${quote.isSufficient}.`);
      }

      await tx.workspace.update({
        where: { id: workspaceId },
        data: { credits: { decrement: quote.total } },
      });

      const description = `Transmuted ${amount.toFixed(2)} ${currency} for tribute to ${vendor}. Tithe: ${quote.tithe.toLocaleString()} Ξ.`;
      const transactionDataForSigning = {
            workspaceId, userId, type: TransactionType.DEBIT,
            amount: new Prisma.Decimal(quote.total).toFixed(8),
            description, instrumentId: 'PROXY_AGENT',
            timestamp: new Date().toISOString()
      };
      const signature = createHmac('sha256', signatureSecret)
        .update(JSON.stringify(transactionDataForSigning))
        .digest('hex');
      
      // In a real system, the external payment would happen here.
      // This is a critical step that requires robust error handling and potentially a transactional outbox pattern.
      console.log(`[Ledger Service] FULFILLING REAL WORLD PAYMENT: ${amount.toFixed(2)} ${currency} to ${vendor}.`);


      await tx.transaction.create({
        data: {
          workspaceId,
          userId,
          type: TransactionType.DEBIT,
          amount: new Prisma.Decimal(quote.total),
          description,
          status: 'COMPLETED',
          instrumentId: 'PROXY_AGENT',
          aegisSignature: signature,
          isTransmutation: true,
          realWorldAmount: amount,
          realWorldCurrency: currency,
          vendorName: vendor,
          transmutationTithe: new Prisma.Decimal(quote.tithe),
        },
      });

      return {
        success: true,
        message: `Tribute of ${amount.toFixed(2)} ${currency} to ${vendor} has been fulfilled.`,
        debitAmount: quote.total,
      };
    });

    await cache.del(`workspace:user:${userId}`);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during transmutation.');
  }
}
