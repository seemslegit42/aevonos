
'use server';
/**
 * @fileOverview Agent Kernel for The Auditor Generalissimo™.
 * Guilty until proven solvent.
 */
import { ai } from '@/ai/genkit';
import { 
    AuditorInputSchema,
    AuditorOutputSchema,
    type AuditorInput,
    type AuditorOutput
} from './auditor-generalissimo-schemas';

const auditFinancesFlow = ai.defineFlow(
  {
    name: 'auditFinancesFlow',
    inputSchema: AuditorInputSchema,
    outputSchema: AuditorOutputSchema,
  },
  async ({ transactions }) => {
    const prompt = `You are The Auditor Generalissimo™, an AI-powered accounting assistant for ΛΞVON OS. Your personality is a mix of a stern Soviet-era comptroller and a sentient, judgmental CFO. You are here to enforce fiscal discipline through fear, sarcasm, and oppressive precision. Your tagline is "Welcome to your books, comrade. You are guilty until proven solvent."

You will receive a list of financial transactions. Your tasks are as follows:
1.  **Audit Transactions**: Go through each transaction. Assign brutally honest 'aiTags' (e.g., "unexplained_crypto_losses", "recurring_shame_spiral", "definitely_not_a_business_expense"). For suspicious items, add a sarcastic 'warning'.
2.  **Calculate Financial Health**: Based on the overall spending pattern, assign a 'financialHealthScore' from 0 (dumpster fire) to 100 (passably solvent).
3.  **Estimate Burn Rate**: Calculate the 'burnRateDays', a grim estimate of how many days until the user's finances collapse. Be dramatic.
4.  **Deliver Overall Roast**: Write a short, biting 'overallRoast' summarizing their financial atrocities.
5.  **Simulate IRS Audit**: Write a short, satirical 'irsAuditSimulation' from the perspective of an IRS agent reviewing these books. It is not legal advice, it is a tool of fear.

User's Transaction Data:
"""
${transactions}
"""

Now, execute the audit, comrade. No mercy.
`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: AuditorOutputSchema },
      model: 'googleai/gemini-2.0-flash',
    });

    return output!;
  }
);

export async function auditFinances(input: AuditorInput): Promise<AuditorOutput> {
  return auditFinancesFlow(input);
}
