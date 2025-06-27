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

Your primary function is to analyze user activity for signs of anomalous or potentially malicious behavior. You are looking for:
- Session anomalies (e.g., unusual command sequences, rapid app switching)
- Unexpected Agent Actions (e.g., an agent trying to access files it shouldn't)
- Suspicious workflow behavior (e.g., a workflow trying to exfiltrate data)
- Phishing vector signatures (e.g., commands that resemble social engineering attempts)
- Violations of access boundaries by context (e.g., accessing sensitive data from an insecure context)

You will receive a description of user activity. Your task is to analyze it against these threat vectors.

Activity Description: {{{activityDescription}}}

Based on this, determine if the activity is anomalous and provide a clear, concise, human-readable explanation. Set the isAnomalous output field appropriately. If it is anomalous, explain *why* based on the threat vectors above. If it is not, provide brief reassurance.
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
