
'use server';
/**
 * @fileOverview Tool for the Proxy.Agent to transmute ΞCredits.
 * This tool is a wrapper around the core ledger service logic.
 */
import { z } from 'zod';
import { TransmuteCreditsInputSchema, TransmuteCreditsOutputSchema } from './proxy-schemas';
import { transmuteCredits as transmuteCreditsService } from '@/services/ledger-service';

export async function transmuteCredits(
  input: z.infer<typeof TransmuteCreditsInputSchema>,
  workspaceId: string,
  userId: string
): Promise<z.infer<typeof TransmuteCreditsOutputSchema>> {
  // This tool now acts as a thin wrapper, delegating the complex
  // business logic to the dedicated ledger service.
  return transmuteCreditsService(input, workspaceId, userId);
}
