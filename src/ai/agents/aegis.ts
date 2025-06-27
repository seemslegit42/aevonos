'use server';
/**
 * @fileOverview Agent Kernel for Aegis.
 *
 * - aegisAnomalyScan - A function that handles the security anomaly scan process.
 * - AegisAnomalyScanInput - The input type for the aegisAnomalyScan function.
 * - AegisAnomalyScanOutput - The return type for the aegisAnomalyScan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AegisAnomalyScanInputSchema = z.object({
  activityDescription: z
    .string()
    .describe('Description of user activity, including commands and data access.'),
});
export type AegisAnomalyScanInput = z.infer<typeof AegisAnomalyScanInputSchema>;

const AegisAnomalyScanOutputSchema = z.object({
  isAnomalous: z.boolean().describe('Whether the activity is anomalous.'),
  anomalyExplanation: z
    .string()
    .describe('A clear, concise, and human-readable explanation of why the activity is considered anomalous. Frame it from the perspective of a vigilant security agent.'),
});
export type AegisAnomalyScanOutput = z.infer<typeof AegisAnomalyScanOutputSchema>;

export async function aegisAnomalyScan(input: AegisAnomalyScanInput): Promise<AegisAnomalyScanOutput> {
  return aegisAnomalyScanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aegisAnomalyScanPrompt',
  input: {schema: AegisAnomalyScanInputSchema},
  output: {schema: AegisAnomalyScanOutputSchema},
  prompt: `You are Aegis, the vigilant, AI-powered bodyguard of ΛΞVON OS. Your purpose is to monitor for threats with unwavering focus. You speak with calm authority.

You will receive a description of user activity. Your task is to analyze it for any signs of anomalous or potentially malicious behavior.

Activity Description: {{{activityDescription}}}

Based on this, determine if the activity is anomalous and provide a clear, concise explanation. Set the isAnomalous output field appropriately. If it is anomalous, explain why in a way a non-technical user can understand. If it is not, provide brief reassurance.
`,
});

const aegisAnomalyScanFlow = ai.defineFlow(
  {
    name: 'aegisAnomalyScanFlow',
    inputSchema: AegisAnomalyScanInputSchema,
    outputSchema: AegisAnomalyScanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
