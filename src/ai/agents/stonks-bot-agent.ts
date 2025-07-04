
'use server';
/**
 * @fileOverview The Stonks Bot Daemon, a specialist agent for "financial advice".
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { StonksBotInputSchema, StonksBotOutputSchema } from './stonks-bot-schemas';
import { getStonksAdvice } from './stonks-bot';

// The input for this agent is the direct, structured input for the StonksBot flow.
export const StonksAgentInputSchema = StonksBotInputSchema;
export type StonksAgentInput = z.infer<typeof StonksAgentInputSchema>;

export const StonksAgentOutputSchema = z.object({
    agent: z.literal('stonks'),
    report: StonksBotOutputSchema,
});
export type StonksAgentOutput = z.infer<typeof StonksAgentOutputSchema>;


const consultStonksBotFlow = ai.defineFlow({
    name: 'consultStonksBotFlow',
    inputSchema: StonksAgentInputSchema,
    outputSchema: StonksAgentOutputSchema,
}, async (input) => {
    // No more triage/parsing needed. The BEEP router extracts the ticker and mode.
    // We pass the structured input directly to the core logic function.
    const report = await getStonksAdvice(input);
    
    return { agent: 'stonks', report };
});

export async function consultStonksBot(input: StonksAgentInput): Promise<StonksAgentOutput> {
  return consultStonksBotFlow(input);
}
