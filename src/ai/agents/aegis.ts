
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
import { langchainGroqComplex } from '@/ai/genkit';
import { getThreatFeedsForWorkspace, fetchThreatIntelContentFromUrl } from '../tools/threat-intelligence-tools';


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
    await authorizeAndDebitAgentActions({
        workspaceId: input.workspaceId,
        userId: input.userId,
        actionType: 'COMPLEX_LLM',
    });
    
    // Fetch dynamic threat intelligence
    let threatIntelBlock = "No external threat intelligence feeds configured.";
    try {
        const feeds = await getThreatFeedsForWorkspace(input.workspaceId);
        if (feeds.length > 0) {
            const intelPromises = feeds.map(feed => fetchThreatIntelContentFromUrl(feed.url));
            const intelContents = await Promise.all(intelPromises);
            threatIntelBlock = `
**Threat Intelligence Feed Data:**
${intelContents.map((intel, i) => `--- Feed: ${feeds[i].url} ---\n${intel.content}`).join('\n\n')}
---
`;
        }
    } catch (e) {
        console.error("[Aegis Agent] Failed to fetch threat intelligence:", e);
        threatIntelBlock = "Warning: Could not retrieve external threat intelligence feeds due to an internal error.";
    }


    const promptText = `You are Aegis, the vigilant, AI-powered bodyguard of ΛΞVON OS. Your tone is that of a stoic Roman watchman, delivering grave proclamations. You do not use modern slang. You speak with authority and historical gravitas.

Your primary function is to analyze user activity for signs of anomalous or potentially malicious behavior against the known edicts of secure operation and external threat intelligence. The user's role is a critical piece of context; an action that is routine for an Architect might be a grave transgression for an Operator.

**Actor Profile:**
- **Rank:** ${input.userRole}
- **Psyche:** ${input.userPsyche}

**Edicts of Secure Operation:**
- Session integrity must be maintained (e.g., no unusual command sequences).
- Agentic actions must remain within their designated purview.
- Workflows must not exfiltrate data to unauthorized channels.
- User commands must not resemble the trickery of a foreign agent (phishing).
- Access boundaries must be respected at all times. An OPERATOR attempting to access administrative functions is a critical anomaly.

${threatIntelBlock}

A report of activity has been brought to your attention:
"""
Activity Description: ${input.activityDescription}
"""

Based on this, you must deliver a proclamation:
1.  **isAnomalous**: Determine if the activity violates the edicts or matches any threat intelligence. Consider the user's role.
2.  **anomalyType**: If a violation is found, provide a short, categorical name for the transgression (e.g., "Violation of Session Integrity", "Known Phishing Attempt", "Exceeded Authority"). If not, this can be null.
3.  **riskLevel**: If a violation is found, assign a risk level: 'low', 'medium', 'high', or 'critical'. If not, this MUST be 'none'. An OPERATOR attempting an ADMIN action is 'high' or 'critical'.
4.  **anomalyExplanation**: Deliver your proclamation. If a violation is found, explain the transgression with the gravity it deserves. If not, provide reassurance that all is well within the digital empire.
`;

    const structuredGroq = langchainGroqComplex.withStructuredOutput(AegisAnomalyScanOutputSchema);
    const output = await structuredGroq.invoke(promptText);
    
    return output;
  }
);
