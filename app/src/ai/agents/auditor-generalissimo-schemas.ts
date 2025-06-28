import { z } from 'zod';

export const TransactionSchema = z.object({
  date: z.string().describe('Date of the transaction (YYYY-MM-DD)'),
  description: z.string().describe('Description of the purchase.'),
  amount: z.number().describe('The amount of the transaction.'),
  category: z.string().optional().describe('User-provided category.'),
});

export const AuditedTransactionSchema = TransactionSchema.extend({
    aiTags: z.array(z.string()).describe('AI-generated tags for the transaction, e.g., "suspicious", "vice", "essentials".'),
    warning: z.string().optional().describe('A sarcastic, judgmental warning or comment about the transaction.'),
});

export const AuditorInputSchema = z.object({
  transactions: z.string().describe('A string containing a list of financial transactions, likely in a CSV-like format.'),
});
export type AuditorInput = z.infer<typeof AuditorInputSchema>;

export const AuditorOutputSchema = z.object({
    financialHealthScore: z.number().min(0).max(100).describe('A score from 0-100 indicating financial health, where 0 is financial ruin and 100 is solvency.'),
    burnRateDays: z.number().describe('The number of days left until financial collapse, based on current spending.'),
    overallRoast: z.string().describe('A general, sarcastic roast of the user\'s financial situation.'),
    overallRoastAudioUri: z.string().optional().describe('A data URI for the text-to-speech audio of the overallRoast.'),
    auditedTransactions: z.array(AuditedTransactionSchema).describe('The list of transactions, now audited with AI commentary.'),
    irsAuditSimulation: z.string().describe('A satirical simulation of an IRS audit based on the provided transactions.'),
});
export type AuditorOutput = z.infer<typeof AuditorOutputSchema>;
