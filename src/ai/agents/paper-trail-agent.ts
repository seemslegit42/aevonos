'use server';
/**
 * @fileOverview The Paper Trail Daemon, a specialist agent for scanning evidence.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PaperTrailScanInputSchema, PaperTrailScanOutputSchema } from './paper-trail-schemas';
import { scanEvidence } from './paper-trail';

export const PaperTrailAgentInputSchema = PaperTrailScanInputSchema;
export type PaperTrailAgentInput = z.infer<typeof PaperTrailAgentInputSchema>;

export const PaperTrailAgentOutputSchema = z.object({
    agent: z.literal('paper-trail'),
    report: PaperTrailScanOutputSchema,
});
export type PaperTrailAgentOutput = z.infer<typeof PaperTrailAgentOutputSchema>;

const consultPaperTrailFlow = ai.defineFlow({
    name: 'consultPaperTrailFlow',
    inputSchema: PaperTrailAgentInputSchema,
    outputSchema: PaperTrailAgentOutputSchema,
}, async (input) => {
    const report = await scanEvidence(input);
    return { agent: 'paper-trail', report };
});

export async function consultPaperTrail(input: PaperTrailAgentInput): Promise<PaperTrailAgentOutput> {
  return consultPaperTrailFlow(input);
}
