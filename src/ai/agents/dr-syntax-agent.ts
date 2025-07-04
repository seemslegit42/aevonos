
'use server';
/**
 * @fileOverview The Dr. Syntax Daemon, a specialist agent for critiquing content.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { DrSyntaxInputSchema, DrSyntaxOutputSchema } from './dr-syntax-schemas';
import { drSyntaxCritique } from './dr-syntax';
import { langchainGroqComplex } from '../genkit';

export const DrSyntaxAgentInputSchema = z.object({
  query: z.string().describe("The user's natural language query asking for a critique."),
  workspaceId: z.string(),
  psyche: DrSyntaxInputSchema.shape.psyche,
});
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
}, async ({ query, workspaceId, psyche }) => {
    
    const structuredTriageModel = langchainGroqComplex.withStructuredOutput(
        DrSyntaxInputSchema.pick({ content: true, contentType: true })
    );

    const triageResult = await structuredTriageModel.invoke(
        `Parse the user's request to extract the content to be critiqued and its type (prompt, code, or copy). The user's query is: "${query}"`
    );
    
    const report = await drSyntaxCritique({
        ...triageResult,
        workspaceId,
        psyche,
    });
    
    return { agent: 'dr-syntax', report };
});

export async function consultDrSyntax(input: DrSyntaxAgentInput): Promise<DrSyntaxAgentOutput> {
  return consultDrSyntaxFlow(input);
}
