'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { createTransaction } from '@/services/ledger-service';
import { CreateManualTransactionInputSchema, TransactionSchema } from './ledger-schemas';
import type { CreateManualTransactionInput, Transaction } from './ledger-schemas';

const createManualTransactionFlow = ai.defineFlow(
  {
    name: 'createManualTransactionFlow',
    inputSchema: CreateManualTransactionInputSchema.extend({ workspaceId: z.string(), userId: z.string() }),
    outputSchema: TransactionSchema,
  },
  async (input) => {
    // This is a direct financial transaction, so it's not a billable "agent action" in the same way.
    // The cost is the transaction itself. The ledger service handles the actual credit change.
    const transaction = await createTransaction(input);
    // Prisma Decimal needs to be converted to number for Zod schema validation
    return { 
        ...transaction,
        amount: Number(transaction.amount)
    };
  }
);

export async function createManualTransaction(input: CreateManualTransactionInput, workspaceId: string, userId: string): Promise<Transaction> {
    const result = await createManualTransactionFlow({ ...input, workspaceId, userId });
    return result;
}
