
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
import { incrementAgentActions } from '@/services/billing-service';


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

Based on this, you must complete the full analysis:
1.  **isAnomalous**: Determine if the activity is anomalous.
2.  **anomalyType**: If anomalous, provide a short, categorical name for the threat (e.g., "Suspicious Command", "Data Access Violation", "Potential Phishing Attempt"). If not anomalous, this can be null.
3.  **riskLevel**: If anomalous, assign a risk level: 'low', 'medium', 'high', or 'critical'. If not anomalous, this MUST be 'none'.
4.  **anomalyExplanation**: Provide a clear, concise, human-readable explanation. If anomalous, explain *why*. If not, provide brief reassurance.
`,
});

const aegisAnomalyScanFlow = ai.defineFlow(
  {
    name: 'aegisAnomalyScanFlow',
    inputSchema: AegisAnomalyScanInputSchema,
    outputSchema: AegisAnomalyScanOutputSchema,
  },
  async input => {
    await incrementAgentActions(input.workspaceId);
    const {output} = await prompt(input);
    return output!;
  }
);
