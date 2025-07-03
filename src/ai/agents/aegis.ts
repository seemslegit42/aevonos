
'use server';
/**
 * @fileOverview Agent Kernel for Aegis, now a LangGraph state machine.
 *
 * - aegisAnomalyScan - A function that handles the security anomaly scan process.
 * - AegisAnomalyScanInput - The input type for the aegisAnomalyScan function.
 * - AegisAnomalyScanOutput - The return type for the aegisAnomalyScan function.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage, SystemMessage } from '@langchain/core/messages';
import { z } from 'zod';
import {ai} from '@/ai/genkit';
import {
    AegisAnomalyScanInputSchema, 
    AegisAnomalyScanOutputSchema,
    type AegisAnomalyScanInput,
    type AegisAnomalyScanOutput
} from './aegis-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { langchainGroqComplex, langchainGroqFast } from '@/ai/genkit';
import { getThreatFeedsForWorkspace, fetchThreatIntelContentFromUrl } from '../tools/threat-intelligence-tools';
import { getSecurityEdicts } from '../tools/security-tools';
import { SecurityRiskLevel } from '@prisma/client';
import { getUserActivityHistory } from '@/services/activity-log-service';

// 1. Define Agent State
const ActivityCategorySchema = z.enum(["Data Access", "Financial", "System Config", "General"]);
type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

interface AegisAgentState {
  messages: BaseMessage[];
  input: AegisAnomalyScanInput;
  threatIntelContent: string;
  securityEdicts: string[];
  activityCategory: ActivityCategory;
  finalReport: AegisAnomalyScanOutput | null;
  activityHistory: string[];
}

// 2. Define Agent Nodes

const fetchThreatIntelligence = async (state: AegisAgentState): Promise<Partial<AegisAgentState>> => {
  const { input, messages } = state;
  let threatIntelBlock = "No external threat intelligence feeds configured.";
  const threatIndicators: string[] = [];
  const newMessages: BaseMessage[] = [];

  try {
    const feeds = await getThreatFeedsForWorkspace(input.workspaceId);
    if (feeds.length > 0) {
      const intelPromises = feeds.map(feed => fetchThreatIntelContentFromUrl(feed.url));
      const intelContents = await Promise.all(intelPromises);

      // Active analysis of threat feeds
      intelContents.forEach((intel, i) => {
        const feedContentLines = intel.content.split('\n').filter(line => line.trim() !== '');
        for (const line of feedContentLines) {
          const indicator = line.trim();
          if (indicator && input.activityDescription.toLowerCase().includes(indicator.toLowerCase())) {
            threatIndicators.push(`Activity matches known threat indicator '${indicator}' from feed: ${feeds[i].url}`);
          }
        }
      });
      
      threatIntelBlock = `
**Threat Intelligence Feed Data (Summary):**
${intelContents.map((intel, i) => `--- Feed: ${feeds[i].url} ---\n${intel.content.substring(0, 150)}...`).join('\n\n')}
---
`;
    }
  } catch (e) {
    console.error("[Aegis Agent] Failed to fetch threat intelligence:", e);
    threatIntelBlock = "Warning: Could not retrieve external threat intelligence feeds due to an internal error.";
  }

  if (threatIndicators.length > 0) {
      const threatMessage = new SystemMessage({
          content: `URGENT_THREAT_INTEL_MATCH::The following known threat indicators were found in the current activity:\n${threatIndicators.join('\n')}`
      });
      newMessages.push(threatMessage);
  }

  return { threatIntelContent: threatIntelBlock, messages: newMessages };
};


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

const fetchContextData = async (state: AegisAgentState): Promise<Partial<AegisAgentState>> => {
    console.log('[Aegis Agent] Fetching threat intel and security edicts in parallel...');
    const [intelResult, edictsResult] = await Promise.all([
        fetchThreatIntelligence(state),
        fetchSecurityEdicts(state)
    ]);
    return { ...intelResult, ...edictsResult };
};

const fetchActivityHistory = async (state: AegisAgentState): Promise<Partial<AegisAgentState>> => {
  const { input } = state;
  try {
    const history = await getUserActivityHistory(input.userId);
    return { activityHistory: history };
  } catch (e) {
    console.error("[Aegis Agent] Failed to fetch activity history:", e);
    return { activityHistory: ["Warning: Could not retrieve user activity history."] };
  }
};

const categorizeActivity = async (state: AegisAgentState): Promise<Partial<AegisAgentState>> => {
  const { input } = state;
  const triageSchema = z.object({
    category: ActivityCategorySchema
      .describe("Categorize the user's activity. 'Data Access' for reading/writing user data. 'Financial' for transactions. 'System Config' for admin actions. 'General' for everything else.")
  });
  
  const triageModel = langchainGroqFast.withStructuredOutput(triageSchema);
  try {
      const result = await triageModel.invoke(`Categorize this activity: "${input.activityDescription}"`);
      return { activityCategory: result.category };
  } catch (e) {
      console.error("[Aegis Agent] Failed to categorize activity, defaulting to 'General':", e);
      return { activityCategory: 'General' };
  }
};

const analyzeActivity = async (state: AegisAgentState): Promise<Partial<AegisAgentState>> => {
    const { input, threatIntelContent, securityEdicts, activityCategory, activityHistory, messages } = state;

    const edictsBlock = securityEdicts.map(edict => `- ${edict}`).join('\n');
    const historyBlock = activityHistory.length > 0
        ? `**Recent User Activity History (newest first):**\n${activityHistory.join('\n')}`
        : "No recent activity history available.";
    
    // The main prompt is now a system message, which will be part of the message history passed to the model.
    const systemPrompt = new SystemMessage(`You are Aegis, the vigilant, AI-powered bodyguard of ΛΞVON OS. Your tone is that of a stoic Roman watchman, delivering grave proclamations. You do not use modern slang. You speak with authority and historical gravitas.

Your primary function is to analyze user activity for signs of anomalous or potentially malicious behavior against the known edicts of secure operation and external threat intelligence. You will receive context in a series of messages.
If you receive a system message starting with 'URGENT_THREAT_INTEL_MATCH::', you must treat it as a high-priority finding. A match with a known threat indicator is a strong signal of anomalous activity and should be flagged with at least 'high' risk.

**Crucially, you must analyze the user's recent activity history for suspicious patterns over time.** A single action may seem harmless, but a sequence of actions could reveal a larger threat, such as data exfiltration (e.g., repeatedly listing and then exporting small amounts of data) or brute-force attempts.

**Actor Profile:**
- **Rank:** ${input.userRole}
- **Psyche:** ${input.userPsyche}
- **Activity Category**: ${activityCategory}

**Edicts of Secure Operation:**
${edictsBlock}

${historyBlock}

${threatIntelContent}

A report of the most recent activity has been brought to your attention:
"""
Activity Description: ${input.activityDescription}
"""

Based on all the provided context, you must deliver a proclamation:
1.  **isAnomalous**: Determine if the activity (or pattern of activities) violates the edicts or matches any threat intelligence. Consider the user's role and the activity category.
2.  **anomalyType**: If a violation is found, provide a short, categorical name for the transgression (e.g., "Suspicious Activity Pattern", "Data Access Violation", "Known Phishing Attempt", "Exceeded Authority"). If not, this can be null.
3.  **riskLevel**: If a violation is found, assign a risk level: 'low', 'medium', 'high', or 'critical'. If not, this MUST be 'none'. An OPERATOR attempting an ADMIN action is 'high' or 'critical'. A match on a threat indicator is also 'high' or 'critical'.
4.  **anomalyExplanation**: Deliver your proclamation. If a violation is found, explain the transgression with the gravity it deserves. If not, provide reassurance that all is well within the digital empire.`);

    const structuredGroq = langchainGroqComplex.withStructuredOutput(AegisAnomalyScanOutputSchema);
    
    // Pass the entire message history, including our newly constructed system prompt.
    const fullMessages = [...messages, systemPrompt];
    const output = await structuredGroq.invoke(fullMessages);
    
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
    activityCategory: { value: (x, y) => y, default: () => 'General' },
    finalReport: { value: (x, y) => y, default: () => null },
    activityHistory: { value: (x, y) => y, default: () => [] },
  },
});

workflow.addNode('fetch_context_data', fetchContextData);
workflow.addNode('fetch_activity_history', fetchActivityHistory);
workflow.addNode('categorize', categorizeActivity);
workflow.addNode('analyze', analyzeActivity);

workflow.setEntryPoint('fetch_context_data');
workflow.addEdge('fetch_context_data', 'fetch_activity_history');
workflow.addEdge('fetch_activity_history', 'categorize');
workflow.addEdge('categorize', 'analyze');
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
  };

  const result = await aegisApp.invoke(initialState);
  
  if (!result.finalReport) {
      throw new Error("Aegis scan failed to produce a final report.");
  }
  
  return result.finalReport;
}
