
'use server';
/**
 * @fileOverview The Lucille Bluth Daemon, a specialist agent for judgmental budgeting.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { LucilleBluthInputSchema, LucilleBluthOutputSchema } from './lucille-bluth-schemas';
import { analyzeExpense } from './lucille-bluth';

export const LucilleBluthAgentInputSchema = LucilleBluthInputSchema;
export type LucilleBluthAgentInput = z.infer<typeof LucilleBluthAgentInputSchema>;

export const LucilleBluthAgentOutputSchema = z.object({
    agent: z.literal('lucille-bluth'),
    report: LucilleBluthOutputSchema,
});
export type LucilleBluthAgentOutput = z.infer<typeof LucilleBluthAgentOutputSchema>;

const consultLucilleFlow = ai.defineFlow({
    name: 'consultLucilleFlow',
    inputSchema: LucilleBluthAgentInputSchema,
    outputSchema: LucilleBluthAgentOutputSchema,
}, async (input) => {
    const report = await analyzeExpense(input);
    return { agent: 'lucille-bluth', report };
});

export async function consultLucille(input: LucilleBluthAgentInput): Promise<LucilleBluthAgentOutput> {
  return consultLucilleFlow(input);
}
