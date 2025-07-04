'use server';
/**
 * @fileOverview The Barbara Daemon, a specialist agent for administrative tasks.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { BarbaraInputSchema, BarbaraOutputSchema } from './barbara-schemas';
import { processDocument } from './barbara';

export const BarbaraAgentInputSchema = BarbaraInputSchema;
export type BarbaraAgentInput = z.infer<typeof BarbaraAgentInputSchema>;

export const BarbaraAgentOutputSchema = z.object({
    agent: z.literal('barbara'),
    report: BarbaraOutputSchema,
});
export type BarbaraAgentOutput = z.infer<typeof BarbaraAgentOutputSchema>;

const consultBarbaraFlow = ai.defineFlow({
    name: 'consultBarbaraFlow',
    inputSchema: BarbaraAgentInputSchema,
    outputSchema: BarbaraAgentOutputSchema,
}, async (input) => {
    const report = await processDocument(input);
    return { agent: 'barbara', report };
});

export async function consultBarbara(input: BarbaraAgentInput): Promise<BarbaraAgentOutput> {
  return consultBarbaraFlow(input);
}
