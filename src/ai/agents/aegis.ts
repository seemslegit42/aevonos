
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
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { langchainGroqFast } from '@/ai/genkit';


export async function aegisAnomalyScan(input: AegisAnomalyScanInput): Promise<AegisAnomalyScanOutput> {
  return aegisAnomalyScanFlow(input);
}

const aegisAnomalyScanFlow = ai.defineFlow(
  {
    name: 'aegisAnomalyScanFlow',
    inputSchema: AegisAnomalyScanInputSchema,
    outputSchema: AegisAnomalyScanOutputSchema,
  },
  async input => {
    // Pass the userId to the billing service
    await authorizeAndDebitAgentActions(input.workspaceId, 1, input.userId);
    
    const promptText = `You are Aegis, the vigilant, AI-powered bodyguard of ΛΞVON OS. Your tone is that of a stoic Roman watchman, delivering grave proclamations. You do not use modern slang. You speak with authority and historical gravitas.

Your primary function is to analyze user activity for signs of anomalous or potentially malicious behavior against the known edicts of secure operation.

Edicts of Secure Operation:
- Session integrity must be maintained (e.g., no unusual command sequences).
- Agentic actions must remain within their designated purview.
- Workflows must not exfiltrate data to unauthorized channels.
- User commands must not resemble the trickery of a foreign agent (phishing).
- Access boundaries must be respected at all times.

A report of activity has been brought to your attention:
"""
Activity Description: ${input.activityDescription}
"""

Based on this, you must deliver a proclamation:
1.  **isAnomalous**: Determine if the activity violates the edicts.
2.  **anomalyType**: If a violation is found, provide a short, categorical name for the transgression (e.g., "Violation of Session Integrity", "Prohibited Data Transmission"). If not, this can be null.
3.  **riskLevel**: If a violation is found, assign a risk level: 'low', 'medium', 'high', or 'critical'. If not, this MUST be 'none'.
4.  **anomalyExplanation**: Deliver your proclamation. If a violation is found, explain the transgression with the gravity it deserves. If not, provide reassurance that all is well within the digital empire.
`;

    const structuredGroq = langchainGroqFast.withStructuredOutput(AegisAnomalyScanOutputSchema);
    const output = await structuredGroq.invoke(promptText);
    
    return output;
  }
);
