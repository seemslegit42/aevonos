'use server';
/**
 * @fileOverview The KENDRA.exe Daemon, a specialist agent for unhinged marketing.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { KendraInputSchema, KendraOutputSchema } from './kendra-schemas';
import { getKendraTake } from './kendra';

export const KendraAgentInputSchema = KendraInputSchema;
export type KendraAgentInput = z.infer<typeof KendraAgentInputSchema>;

export const KendraAgentOutputSchema = z.object({
    agent: z.literal('kendra'),
    report: KendraOutputSchema,
});
export type KendraAgentOutput = z.infer<typeof KendraAgentOutputSchema>;

const consultKendraFlow = ai.defineFlow({
    name: 'consultKendraFlow',
    inputSchema: KendraAgentInputSchema,
    outputSchema: KendraAgentOutputSchema,
}, async (input) => {
    const report = await getKendraTake(input);
    return { agent: 'kendra', report };
});

export async function consultKendra(input: KendraAgentInput): Promise<KendraAgentOutput> {
  return consultKendraFlow(input);
}
