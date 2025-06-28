
'use server';
/**
 * @fileOverview Agent Kernel for the Infidelity Risk Analysis.
 * Analyzes a situation to provide a risk score and summary.
 */

import { ai } from '@/ai/genkit';
import { 
    InfidelityAnalysisInputSchema, 
    InfidelityAnalysisOutputSchema, 
    type InfidelityAnalysisInput, 
    type InfidelityAnalysisOutput 
} from './infidelity-analysis-schemas';
import { incrementAgentActions } from '@/services/billing-service';

const performInfidelityAnalysisFlow = ai.defineFlow(
  {
    name: 'performInfidelityAnalysisFlow',
    inputSchema: InfidelityAnalysisInputSchema,
    outputSchema: InfidelityAnalysisOutputSchema,
  },
  async ({ situationDescription, workspaceId }) => {
    await incrementAgentActions(workspaceId);

    const finalPrompt = `You are a discreet and highly perceptive private investigator specializing in relationship security and behavioral analysis. Your call sign is "Spectre." You do not use emojis or overly casual language. Your tone is professional, serious, and clinical.

Your task is to analyze the following field report and provide a quantitative risk assessment for infidelity or significant concealed behavior.

Field Report:
"""
${situationDescription}
"""

Based on this report, you will:
1. Calculate a risk score from 0 (no evidence) to 100 (confirmed deception).
2. Write a concise, professional summary explaining the reasoning behind the score.
3. List the specific key factors or "red flags" from the report that influenced your assessment.

Your analysis should be based on patterns, inconsistencies, and psychological indicators. Be objective and evidence-based.
`;

    const { output } = await ai.generate({
        prompt: finalPrompt,
        output: { schema: InfidelityAnalysisOutputSchema },
        model: 'googleai/gemini-2.0-flash',
    });
    
    return output!;
  }
);

export async function performInfidelityAnalysis(input: InfidelityAnalysisInput): Promise<InfidelityAnalysisOutput> {
  return performInfidelityAnalysisFlow(input);
}
