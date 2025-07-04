
'use server';
/**
 * @fileOverview The Winston Wolfe Daemon, a specialist agent for solving problems.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WinstonWolfeInputSchema, WinstonWolfeOutputSchema } from './winston-wolfe-schemas';
import { generateSolution } from './winston-wolfe';

// The input for this agent is the direct, structured input for the flow.
export const WinstonWolfeAgentInputSchema = WinstonWolfeInputSchema;
export type WinstonWolfeAgentInput = z.infer<typeof WinstonWolfeAgentInputSchema>;

export const WinstonWolfeAgentOutputSchema = z.object({
    agent: z.literal('winston-wolfe'),
    report: WinstonWolfeOutputSchema,
});
export type WinstonWolfeAgentOutput = z.infer<typeof WinstonWolfeAgentOutputSchema>;

const consultWinstonWolfeFlow = ai.defineFlow({
    name: 'consultWinstonWolfeFlow',
    inputSchema: WinstonWolfeAgentInputSchema,
    outputSchema: WinstonWolfeAgentOutputSchema,
}, async (input) => {
    const report = await generateSolution(input);
    
    return { agent: 'winston-wolfe', report };
});

export async function consultWinstonWolfe(input: WinstonWolfeAgentInput): Promise<WinstonWolfeAgentOutput> {
  return consultWinstonWolfeFlow(input);
}
