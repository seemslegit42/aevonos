'use server';
/**
 * @fileOverview The BEEP Wingman Daemon, a specialist agent for social engineering.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { WingmanInputSchema, WingmanOutputSchema } from './wingman-schemas';
import { generateWingmanMessage } from './wingman';

export const WingmanAgentInputSchema = WingmanInputSchema;
export type WingmanAgentInput = z.infer<typeof WingmanAgentInputSchema>;

export const WingmanAgentOutputSchema = z.object({
    agent: z.literal('wingman'),
    report: WingmanOutputSchema,
});
export type WingmanAgentOutput = z.infer<typeof WingmanAgentOutputSchema>;

const consultWingmanFlow = ai.defineFlow({
    name: 'consultWingmanFlow',
    inputSchema: WingmanAgentInputSchema,
    outputSchema: WingmanAgentOutputSchema,
}, async (input) => {
    const report = await generateWingmanMessage(input);
    return { agent: 'wingman', report };
});

export async function consultWingman(input: WingmanAgentInput): Promise<WingmanAgentOutput> {
  return consultWingmanFlow(input);
}
