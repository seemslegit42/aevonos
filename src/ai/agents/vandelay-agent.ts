'use server';
/**
 * @fileOverview The Vandelay Daemon, a specialist agent for creating alibis.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { VandelayAlibiInputSchema, VandelayAlibiOutputSchema } from './vandelay-schemas';
import { createVandelayAlibi } from './vandelay';

// The input for this agent is the direct, structured input for the flow.
export const VandelayAgentInputSchema = VandelayAlibiInputSchema;
export type VandelayAgentInput = z.infer<typeof VandelayAgentInputSchema>;

export const VandelayAgentOutputSchema = z.object({
    agent: z.literal('vandelay'),
    report: VandelayAlibiOutputSchema,
});
export type VandelayAgentOutput = z.infer<typeof VandelayAgentOutputSchema>;


const consultVandelayFlow = ai.defineFlow({
    name: 'consultVandelayFlow',
    inputSchema: VandelayAgentInputSchema,
    outputSchema: VandelayAgentOutputSchema,
}, async (input) => {
    const report = await createVandelayAlibi(input);
    return { agent: 'vandelay', report };
});

export async function consultVandelay(input: VandelayAgentInput): Promise<VandelayAgentOutput> {
  return consultVandelayFlow(input);
}
