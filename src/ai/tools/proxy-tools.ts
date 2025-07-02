
'use server';
/**
 * @fileOverview Tool for the Proxy.Agent to transmute ΞCredits.
 */
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { Prisma, TransactionType } from '@prisma/client';
import { InsufficientCreditsError } from '@/lib/errors';
import { TransmuteCreditsInputSchema, TransmuteCreditsOutputSchema, type TransmuteCreditsInput } from './proxy-schemas';

const EXCHANGE_RATE = 10000; // 10,000 Ξ per $1
const TRANSMUTATION_TITHE = 0.15; // 15%

export async function transmuteCredits(
  input: TransmuteCreditsInput,
  workspaceId: string,
  userId: string
): Promise<z.infer<typeof TransmuteCreditsOutputSchema>> {
  const { amount, vendor, currency } = TransmuteCreditsInputSchema.parse(input);

  const baseCost = amount * EXCHANGE_RATE;
  const tithe = baseCost * TRANSMUTATION_TITHE;
  const totalDebit = baseCost + tithe;

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { credits: true },
    });

    if (Number(workspace.credits) < totalDebit) {
      throw new InsufficientCreditsError(`Insufficient ΞCredits to transmute. Required: ${totalDebit.toLocaleString()}, Available: ${Number(workspace.credits).toLocaleString()}`);
    }

    await tx.workspace.update({
      where: { id: workspaceId },
      data: { credits: { decrement: totalDebit } },
    });

    await tx.transaction.create({
      data: {
        workspaceId,
        userId,
        type: TransactionType.DEBIT,
        amount: new Prisma.Decimal(totalDebit),
        description: `Transmuted ${amount.toFixed(2)} ${currency} for tribute to ${vendor}. Tithe: ${tithe.toLocaleString()} Ξ.`,
        status: 'COMPLETED',
        instrumentId: 'PROXY_AGENT'
      },
    });

    return {
      success: true,
      message: `Tribute of ${amount.toFixed(2)} ${currency} to ${vendor} has been fulfilled.`,
      debitAmount: totalDebit,
    };
  });
}
