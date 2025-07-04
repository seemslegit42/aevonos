'use server';
/**
 * @fileOverview The Auditor Generalissimo Daemon, a specialist agent for auditing finances.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { AuditorInputSchema, AuditorOutputSchema } from './auditor-generalissimo-schemas';
import { auditFinances } from './auditor-generalissimo';

export const AuditorAgentInputSchema = AuditorInputSchema;
export type AuditorAgentInput = z.infer<typeof AuditorAgentInputSchema>;

export const AuditorAgentOutputSchema = z.object({
    agent: z.literal('auditor'),
    report: AuditorOutputSchema,
});
export type AuditorAgentOutput = z.infer<typeof AuditorAgentOutputSchema>;

const consultAuditorFlow = ai.defineFlow({
    name: 'consultAuditorFlow',
    inputSchema: AuditorAgentInputSchema,
    outputSchema: AuditorAgentOutputSchema,
}, async (input) => {
    const report = await auditFinances(input);
    return { agent: 'auditor', report };
});

export async function consultAuditor(input: AuditorAgentInput): Promise<AuditorAgentOutput> {
  return consultAuditorFlow(input);
}
