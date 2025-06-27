import { z } from 'zod';

export const InfidelityAnalysisInputSchema = z.object({
  situationDescription: z.string().describe('A detailed description of the situation, including behaviors, communication patterns, and any specific incidents.'),
});
export type InfidelityAnalysisInput = z.infer<typeof InfidelityAnalysisInputSchema>;

export const InfidelityAnalysisOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe('A calculated risk score from 0 to 100, representing the likelihood of infidelity or concealed behavior.'),
  riskSummary: z.string().describe('A concise, expert summary of the risk analysis, explaining the score.'),
  keyFactors: z.array(z.string()).describe('A list of the key factors or red flags that contributed to the risk score.'),
});
export type InfidelityAnalysisOutput = z.infer<typeof InfidelityAnalysisOutputSchema>;
