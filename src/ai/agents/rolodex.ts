
'use server';
/**
 * @fileOverview Agent Kernel for The Rolodex.
 * Analyzes candidates and generates recruiting assets.
 */

import { ai } from '@/ai/genkit';
import { 
    RolodexAnalysisInputSchema,
    RolodexAnalysisOutputSchema,
    type RolodexAnalysisInput,
    type RolodexAnalysisOutput
} from './rolodex-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const rolodexAnalysisFlow = ai.defineFlow(
  {
    name: 'rolodexAnalysisFlow',
    inputSchema: RolodexAnalysisInputSchema,
    outputSchema: RolodexAnalysisOutputSchema,
  },
  async ({ candidateName, candidateSummary, jobDescription, workspaceId }) => {
    await authorizeAndDebitAgentActions(workspaceId);

    const prompt = `You are an AI assistant for a recruiter. Your tone is deadpan, efficient, and professional. You are analyzing a candidate for a role.

Job Description:
"""
${jobDescription}
"""

Candidate Name: ${candidateName}
Candidate Summary:
"""
${candidateSummary}
"""

Your tasks:
1.  **Fit Score:** Generate a fit score from 0 to 100 based on how well the candidate's summary matches the job description.
2.  **Icebreaker:** Generate a single, concise, professional, and non-cringey opening line for an outreach email. It should reference a specific detail from their summary.
3.  **Summary:** Write a new, one-sentence summary of the candidate's key qualification or strength as it relates to this role.

Structure your entire output according to the JSON schema.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: RolodexAnalysisOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    return output!;
  }
);

export async function analyzeCandidate(input: RolodexAnalysisInput): Promise<RolodexAnalysisOutput> {
  return rolodexAnalysisFlow(input);
}
