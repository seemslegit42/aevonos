'use server';
/**
 * @fileOverview The J-ROC Daemon, a specialist agent for generating business kits.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { JrocInputSchema, JrocOutputSchema } from './jroc-schemas';
import { generateBusinessKit } from './jroc';

export const JrocAgentInputSchema = JrocInputSchema;
export type JrocAgentInput = z.infer<typeof JrocAgentInputSchema>;

export const JrocAgentOutputSchema = z.object({
    agent: z.literal('jroc'),
    report: JrocOutputSchema,
});
export type JrocAgentOutput = z.infer<typeof JrocAgentOutputSchema>;

const consultJrocFlow = ai.defineFlow({
    name: 'consultJrocFlow',
    inputSchema: JrocAgentInputSchema,
    outputSchema: JrocAgentOutputSchema,
}, async (input) => {
    const report = await generateBusinessKit(input);
    return { agent: 'jroc', report };
});

export async function consultJroc(input: JrocAgentInput): Promise<JrocAgentOutput> {
  return consultJrocFlow(input);
}
