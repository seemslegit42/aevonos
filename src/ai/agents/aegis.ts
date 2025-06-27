'use server';
/**
 * @fileOverview Agent Kernel for Aegis.
 *
 * - aegisAnomalyScan - A function that handles the security anomaly scan process.
 * - AegisAnomalyScanInput - The input type for the aegisAnomalyScan function.
 * - AegisAnomalyScanOutput - The return type for the aegisAnomalyScan function.
 */

import {ai} from '@/ai/genkit';
import {
    AegisAnomalyScanInputSchema, 
    AegisAnomalyScanOutputSchema,
    type AegisAnomalyScanInput,
    type AegisAnomalyScanOutput
} from './aegis-schemas';


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
