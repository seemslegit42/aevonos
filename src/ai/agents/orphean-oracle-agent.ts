'use server';
/**
 * @fileOverview The Orphean Oracle Daemon, a specialist agent for data narration.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { OrpheanOracleInputSchema, OrpheanOracleOutputSchema } from './orphean-oracle-schemas';
import { invokeOracle } from './orphean-oracle-flow';

export const OrpheanOracleAgentInputSchema = OrpheanOracleInputSchema;
export type OrpheanOracleAgentInput = z.infer<typeof OrpheanOracleAgentInputSchema>;

export const OrpheanOracleAgentOutputSchema = z.object({
    agent: z.literal('orphean-oracle'),
    report: OrpheanOracleOutputSchema,
});
export type OrpheanOracleAgentOutput = z.infer<typeof OrpheanOracleAgentOutputSchema>;

const consultOracleFlow = ai.defineFlow({
    name: 'consultOracleFlow',
    inputSchema: OrpheanOracleAgentInputSchema,
    outputSchema: OrpheanOracleAgentOutputSchema,
}, async (input) => {
    const report = await invokeOracle(input);
    return { agent: 'orphean-oracle', report };
});

export async function consultOrpheanOracle(input: OrpheanOracleAgentInput): Promise<OrpheanOracleAgentOutput> {
  return consultOracleFlow(input);
}
