
import { z } from 'zod';

export const TransmuteCreditsInputSchema = z.object({
  amount: z.number().positive(),
  vendor: z.string(),
  currency: z.string().default('CAD'),
});
export type TransmuteCreditsInput = z.infer<typeof TransmuteCreditsInputSchema>;

export const TransmuteCreditsOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  debitAmount: z.number(),
});
export type TransmuteCreditsOutput = z.infer<typeof TransmuteCreditsOutputSchema>;
