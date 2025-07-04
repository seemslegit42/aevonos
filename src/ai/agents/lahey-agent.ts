'use server';
/**
 * @fileOverview The Lahey Surveillance Daemon, a specialist agent for analyzing logs.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { LaheyAnalysisInputSchema, LaheyAnalysisOutputSchema } from './lahey-schemas';
import { analyzeLaheyLog } from './lahey';

export const LaheyAgentInputSchema = LaheyAnalysisInputSchema;
export type LaheyAgentInput = z.infer<typeof LaheyAgentInputSchema>;

export const LaheyAgentOutputSchema = z.object({
    agent: z.literal('lahey_surveillance'),
    report: LaheyAnalysisOutputSchema,
});
export type LaheyAgentOutput = z.infer<typeof LaheyAgentOutputSchema>;

const consultLaheyFlow = ai.defineFlow({
    name: 'consultLaheyFlow',
    inputSchema: LaheyAgentInputSchema,
    outputSchema: LaheyAgentOutputSchema,
}, async (input) => {
    const report = await analyzeLaheyLog(input);
    return { agent: 'lahey_surveillance', report };
});

export async function consultLahey(input: LaheyAgentInput): Promise<LaheyAgentOutput> {
  return consultLaheyFlow(input);
}
