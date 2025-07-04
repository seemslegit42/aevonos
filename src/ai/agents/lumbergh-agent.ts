
'use server';
/**
 * @fileOverview The Project Lumbergh Daemon, a specialist agent for analyzing meeting invites.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { LumberghAnalysisInputSchema, LumberghAnalysisOutputSchema } from './lumbergh-schemas';
import { analyzeInvite } from './lumbergh';

export const LumberghAgentInputSchema = LumberghAnalysisInputSchema;
export type LumberghAgentInput = z.infer<typeof LumberghAgentInputSchema>;

export const LumberghAgentOutputSchema = z.object({
    agent: z.literal('lumbergh'),
    report: LumberghAnalysisOutputSchema,
});
export type LumberghAgentOutput = z.infer<typeof LumberghAgentOutputSchema>;

const consultLumberghFlow = ai.defineFlow({
    name: 'consultLumberghFlow',
    inputSchema: LumberghAgentInputSchema,
    outputSchema: LumberghAgentOutputSchema,
}, async (input) => {
    const report = await analyzeInvite(input);
    return { agent: 'lumbergh', report };
});

export async function consultLumbergh(input: LumberghAgentInput): Promise<LumberghAgentOutput> {
  return consultLumberghFlow(input);
}
