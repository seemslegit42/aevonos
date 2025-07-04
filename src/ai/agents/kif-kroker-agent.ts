
'use server';
/**
 * @fileOverview The Kif Kroker Daemon, a specialist agent for analyzing team comms.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { KifKrokerAnalysisInputSchema, KifKrokerAnalysisOutputSchema } from './kif-kroker-schemas';
import { analyzeComms } from './kif-kroker';

export const KifKrokerAgentInputSchema = KifKrokerAnalysisInputSchema;
export type KifKrokerAgentInput = z.infer<typeof KifKrokerAgentInputSchema>;

export const KifKrokerAgentOutputSchema = z.object({
    agent: z.literal('kif-kroker'),
    report: KifKrokerAnalysisOutputSchema,
});
export type KifKrokerAgentOutput = z.infer<typeof KifKrokerAgentOutputSchema>;


const consultKifKrokerFlow = ai.defineFlow({
    name: 'consultKifKrokerFlow',
    inputSchema: KifKrokerAgentInputSchema,
    outputSchema: KifKrokerAgentOutputSchema,
}, async (input) => {
    const report = await analyzeComms(input);
    return { agent: 'kif-kroker', report };
});

export async function consultKifKroker(input: KifKrokerAgentInput): Promise<KifKrokerAgentOutput> {
  return consultKifKrokerFlow(input);
}
