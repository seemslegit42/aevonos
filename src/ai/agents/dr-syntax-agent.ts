
'use server';
/**
 * @fileOverview The Dr. Syntax Daemon, a specialist agent for critiquing content.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { DrSyntaxInputSchema, DrSyntaxOutputSchema } from './dr-syntax-schemas';
import { drSyntaxCritique } from './dr-syntax';
import { langchainGroqComplex } from '../genkit';

// The input for this agent is the direct, structured input for the critique flow.
export const DrSyntaxAgentInputSchema = DrSyntaxInputSchema;
export type DrSyntaxAgentInput = z.infer<typeof DrSyntaxAgentInputSchema>;

export const DrSyntaxAgentOutputSchema = z.object({
    agent: z.literal('dr-syntax'),
    report: DrSyntaxOutputSchema,
});
export type DrSyntaxAgentOutput = z.infer<typeof DrSyntaxAgentOutputSchema>;


const consultDrSyntaxFlow = ai.defineFlow({
    name: 'consultDrSyntaxFlow',
    inputSchema: DrSyntaxAgentInputSchema,
    outputSchema: DrSyntaxAgentOutputSchema,
}, async (input) => {
    // No more triage/parsing needed here. BEEP's router does that.
    // We pass the structured input directly to the core logic function.
    const report = await drSyntaxCritique(input);
    
    return { agent: 'dr-syntax', report };
});

export async function consultDrSyntax(input: DrSyntaxAgentInput): Promise<DrSyntaxAgentOutput> {
  return consultDrSyntaxFlow(input);
}
