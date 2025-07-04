'use server';
/**
 * @fileOverview The Foremanator Daemon, a specialist agent for processing daily logs.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { ForemanatorLogInputSchema, ForemanatorLogOutputSchema } from './foremanator-schemas';
import { processDailyLog } from './foremanator';

export const ForemanatorAgentInputSchema = ForemanatorLogInputSchema;
export type ForemanatorAgentInput = z.infer<typeof ForemanatorAgentInputSchema>;

export const ForemanatorAgentOutputSchema = z.object({
    agent: z.literal('foremanator'),
    report: ForemanatorLogOutputSchema,
});
export type ForemanatorAgentOutput = z.infer<typeof ForemanatorAgentOutputSchema>;

const consultForemanatorFlow = ai.defineFlow({
    name: 'consultForemanatorFlow',
    inputSchema: ForemanatorAgentInputSchema,
    outputSchema: ForemanatorAgentOutputSchema,
}, async (input) => {
    const report = await processDailyLog(input);
    return { agent: 'foremanator', report };
});

export async function consultForemanator(input: ForemanatorAgentInput): Promise<ForemanatorAgentOutput> {
  return consultForemanatorFlow(input);
}
