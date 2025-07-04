'use server';
/**
 * @fileOverview The Patrickt™ Daemon, a specialist agent for... that guy.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PatricktAgentInputSchema, PatricktAgentOutputSchema } from './patrickt-agent-schemas';
import { processPatricktAction } from './patrickt';

export const PatricktAgentWrapperInputSchema = PatricktAgentInputSchema;
export type PatricktAgentWrapperInput = z.infer<typeof PatricktAgentWrapperInputSchema>;

export const PatricktAgentWrapperOutputSchema = z.object({
    agent: z.literal('patrickt-app'),
    report: PatricktAgentOutputSchema,
});
export type PatricktAgentWrapperOutput = z.infer<typeof PatricktAgentWrapperOutputSchema>;

const consultPatricktFlow = ai.defineFlow({
    name: 'consultPatricktFlow',
    inputSchema: PatricktAgentWrapperInputSchema,
    outputSchema: PatricktAgentWrapperOutputSchema,
}, async (input) => {
    const report = await processPatricktAction(input);
    return { agent: 'patrickt-app', report };
});

export async function consultPatrickt(input: PatricktAgentWrapperInput): Promise<PatricktAgentWrapperOutput> {
  return consultPatricktFlow(input);
}
