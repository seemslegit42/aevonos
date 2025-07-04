'use server';
/**
 * @fileOverview The Rolodex Daemon, a specialist agent for recruiting analysis.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { RolodexAnalysisInputSchema, RolodexAnalysisOutputSchema } from './rolodex-schemas';
import { analyzeCandidate } from './rolodex';

export const RolodexAgentInputSchema = RolodexAnalysisInputSchema;
export type RolodexAgentInput = z.infer<typeof RolodexAgentInputSchema>;

export const RolodexAgentOutputSchema = z.object({
    agent: z.literal('rolodex'),
    report: RolodexAnalysisOutputSchema,
});
export type RolodexAgentOutput = z.infer<typeof RolodexAgentOutputSchema>;

const consultRolodexFlow = ai.defineFlow({
    name: 'consultRolodexFlow',
    inputSchema: RolodexAgentInputSchema,
    outputSchema: RolodexAgentOutputSchema,
}, async (input) => {
    const report = await analyzeCandidate(input);
    return { agent: 'rolodex', report };
});

export async function consultRolodex(input: RolodexAgentInput): Promise<RolodexAgentOutput> {
  return consultRolodexFlow(input);
}
