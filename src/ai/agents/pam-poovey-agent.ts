
'use server';
/**
 * @fileOverview The Pam Poovey Daemon, a specialist agent for HR... stuff.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PamScriptInputSchema, PamAudioOutputSchema } from './pam-poovey-schemas';
import { generatePamRant } from './pam-poovey';

export const PamPooveyAgentInputSchema = PamScriptInputSchema;
export type PamPooveyAgentInput = z.infer<typeof PamPooveyAgentInputSchema>;

export const PamPooveyAgentOutputSchema = z.object({
    agent: z.literal('pam-poovey'),
    report: PamAudioOutputSchema,
});
export type PamPooveyAgentOutput = z.infer<typeof PamPooveyAgentOutputSchema>;

const consultPamFlow = ai.defineFlow({
    name: 'consultPamFlow',
    inputSchema: PamPooveyAgentInputSchema,
    outputSchema: PamPooveyAgentOutputSchema,
}, async (input) => {
    const report = await generatePamRant(input);
    return { agent: 'pam-poovey', report };
});

export async function consultPam(input: PamPooveyAgentInput): Promise<PamPooveyAgentOutput> {
  return consultPamFlow(input);
}
