
'use server';
/**
 * @fileOverview Agent Kernel for Aegis, now a LangGraph state machine.
 *
 * - aegisAnomalyScan - A function that handles the security anomaly scan process.
 * - AegisAnomalyScanInput - The input type for the aegisAnomalyScan function.
 * - AegisAnomalyScanOutput - The return type for the aegisAnomalyScan function.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
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
import { getSecurityEdicts } from '../tools/security-tools';
import { SecurityRiskLevel } from '@prisma/client';

// 1. Define Agent State
interface AegisAgentState {
  messages: BaseMessage[];
  input: AegisAnomalyScanInput;
  threatIntelContent: string;
  securityEdicts: string[];
  finalReport: AegisAnomalyScanOutput | null;
}

// 2. Define Agent Nodes

// Node to fetch threat intelligence
const fetchThreatIntelligence = async (state: AegisAgentState): Promise<Partial<AegisAgentState>> => {
  const { input } = state;
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
  return { threatIntelContent: threatIntelBlock };
};

// Node to fetch security edicts from the database
const fetchSecurityEdicts = async (state: AegisAgentState): Promise<Partial<AegisAgentState>> => {
  const { input } = state;
  try {
      const edicts = await getSecurityEdicts(input.workspaceId);
      if (edicts.length === 0) {
        return { securityEdicts: ["No specific edicts configured. Use general security principles."] };
      }
      return { securityEdicts: edicts };
  } catch (e) {
      console.error("[Aegis Agent] Failed to fetch security edicts:", e);
      return { securityEdicts: ["Warning: Could not retrieve security edicts. Proceeding with caution."] };
  }
};


// Node to analyze the activity against the intel and edicts
const analyzeActivity = async (state: AegisAgentState): Promise<Partial<AegisAgentState>> => {
    const { input, threatIntelContent, securityEdicts } = state;

    const edictsBlock = securityEdicts.map(edict => `- ${edict}`).join('\n');

    const promptText = `You are Aegis, the vigilant, AI-powered bodyguard of ΛΞVON OS. Your tone is that of a stoic Roman watchman, delivering grave proclamations. You do not use modern slang. You speak with authority and historical gravitas.

Your primary function is to analyze user activity for signs of anomalous or potentially malicious behavior against the known edicts of secure operation and external threat intelligence. The user's role is a critical piece of context; an action that is routine for an Architect might be a grave transgression for an Operator.

**Actor Profile:**
- **Rank:** ${input.userRole}
- **Psyche:** ${input.userPsyche}

**Edicts of Secure Operation:**
${edictsBlock}

${threatIntelContent}

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
    
    // Ensure riskLevel is set correctly when not anomalous
    if (!output.isAnomalous) {
        output.riskLevel = SecurityRiskLevel.none;
    }

    return { finalReport: output };
};


// 3. Build the Graph
const workflow = new StateGraph<AegisAgentState>({
  channels: {
    messages: { value: (x, y) => x.concat(y), default: () => [] },
    input: { value: (x, y) => y },
    threatIntelContent: { value: (x, y) => y },
    securityEdicts: { value: (x, y) => y, default: () => [] },
    finalReport: { value: (x, y) => y, default: () => null },
  },
});

workflow.addNode('fetch_intel', fetchThreatIntelligence);
workflow.addNode('fetch_edicts', fetchSecurityEdicts);
workflow.addNode('analyze', analyzeActivity);

workflow.setEntryPoint('fetch_intel');
workflow.addEdge('fetch_intel', 'fetch_edicts');
workflow.addEdge('fetch_edicts', 'analyze');
workflow.addEdge('analyze', END);

const aegisApp = workflow.compile();

// 4. Exported function that uses the graph
export async function aegisAnomalyScan(input: AegisAnomalyScanInput): Promise<AegisAnomalyScanOutput> {
  // Pass the userId to the billing service
  await authorizeAndDebitAgentActions({
      workspaceId: input.workspaceId,
      userId: input.userId,
      actionType: 'COMPLEX_LLM',
  });

  const initialState: Partial<AegisAgentState> = {
      messages: [],
      input: input,
      threatIntelContent: '',
      securityEdicts: [],
      finalReport: null
  };

  const result = await aegisApp.invoke(initialState);
  
  if (!result.finalReport) {
      throw new Error("Aegis scan failed to produce a final report.");
  }
  
  return result.finalReport;
}
