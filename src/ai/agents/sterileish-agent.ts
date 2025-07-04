'use server';
/**
 * @fileOverview The STERILE-ish Daemon, a specialist agent for compliance vibe-checks.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { SterileishAnalysisInputSchema, SterileishAnalysisOutputSchema } from './sterileish-schemas';
import { analyzeCompliance } from './sterileish';

export const SterileishAgentInputSchema = SterileishAnalysisInputSchema;
export type SterileishAgentInput = z.infer<typeof SterileishAgentInputSchema>;

export const SterileishAgentOutputSchema = z.object({
    agent: z.literal('sterileish'),
    report: SterileishAnalysisOutputSchema,
});
export type SterileishAgentOutput = z.infer<typeof SterileishAgentOutputSchema>;

const consultSterileishFlow = ai.defineFlow({
    name: 'consultSterileishFlow',
    inputSchema: SterileishAgentInputSchema,
    outputSchema: SterileishAgentOutputSchema,
}, async (input) => {
    const report = await analyzeCompliance(input);
    return { agent: 'sterileish', report };
});

export async function consultSterileish(input: SterileishAgentInput): Promise<SterileishAgentOutput> {
  return consultSterileishFlow(input);
}
