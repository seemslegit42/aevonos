'use server';
/**
 * @fileOverview The Reno Mode Daemon, a specialist agent for car shame analysis.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { RenoModeAnalysisInputSchema, RenoModeAnalysisOutputSchema } from './reno-mode-schemas';
import { analyzeCarShame } from './reno-mode';

export const RenoModeAgentInputSchema = RenoModeAnalysisInputSchema;
export type RenoModeAgentInput = z.infer<typeof RenoModeAgentInputSchema>;

export const RenoModeAgentOutputSchema = z.object({
    agent: z.literal('reno-mode'),
    report: RenoModeAnalysisOutputSchema,
});
export type RenoModeAgentOutput = z.infer<typeof RenoModeAgentOutputSchema>;

const consultRenoModeFlow = ai.defineFlow({
    name: 'consultRenoModeFlow',
    inputSchema: RenoModeAgentInputSchema,
    outputSchema: RenoModeAgentOutputSchema,
}, async (input) => {
    const report = await analyzeCarShame(input);
    return { agent: 'reno-mode', report };
});

export async function consultRenoMode(input: RenoModeAgentInput): Promise<RenoModeAgentOutput> {
  return consultRenoModeFlow(input);
}
