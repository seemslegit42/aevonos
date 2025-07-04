
'use server';
/**
 * @fileOverview The Stonks Bot Daemon, a specialist agent for "financial advice".
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { StonksBotInputSchema, StonksBotOutputSchema } from './stonks-bot-schemas';
import { getStonksAdvice } from './stonks-bot';
import { langchainGroqComplex } from '../genkit';

export const StonksAgentInputSchema = z.object({
  query: z.string().describe("The user's natural language query about a stock."),
  workspaceId: z.string(),
  userId: z.string(),
});
export type StonksAgentInput = z.infer<typeof StonksAgentInputSchema>;

export const StonksAgentOutputSchema = z.object({
    agent: z.literal('stonks'),
    report: StonksBotOutputSchema,
});
export type StonksAgentOutput = z.infer<typeof StonksAgentOutputSchema>;


const consultStonksBotFlow = ai.defineFlow({
    name: 'consultStonksBotFlow',
    inputSchema: StonksAgentInputSchema,
    outputSchema: StonksAgentOutputSchema,
}, async ({ query, workspaceId, userId }) => {
    
    const structuredTriageModel = langchainGroqComplex.withStructuredOutput(
        StonksBotInputSchema.pick({ ticker: true, mode: true })
    );

    const triageResult = await structuredTriageModel.invoke(
        `Parse the user's request to extract the stock ticker and the desired personality mode ('Meme-Lord', 'MBAcore', 'Oracle Mode'). The user's query is: "${query}"`
    );
    
    const report = await getStonksAdvice({
        ...triageResult,
        workspaceId,
        userId,
    });
    
    return { agent: 'stonks', report };
});

export async function consultStonksBot(input: StonksAgentInput): Promise<StonksAgentOutput> {
  return consultStonksBotFlow(input);
}
