import { z } from 'zod';
import { TransactionStatus, TransactionType } from '@prisma/client';

export const CreateManualTransactionInputSchema = z.object({
  type: z.nativeEnum(TransactionType).describe("The type of transaction: CREDIT for refunds/additions, DEBIT for charges."),
  amount: z.number().positive().describe("The amount of credits for the transaction."),
  description: z.string().describe("A clear description of the reason for the transaction, e.g., 'Charge for custom report generation'.")
});
export type CreateManualTransactionInput = z.infer<typeof CreateManualTransactionInputSchema>;

export const TransactionSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  type: z.nativeEnum(TransactionType),
  amount: z.number(), // Using number as Prisma Decimal will be converted
  description: z.string(),
  status: z.nativeEnum(TransactionStatus),
  createdAt: z.date().or(z.string()),
});
export type Transaction = z.infer<typeof TransactionSchema>;
