import { z } from 'zod';

export const RolodexAnalysisInputSchema = z.object({
  candidateName: z.string().describe("The candidate's full name."),
  candidateSummary: z.string().describe("A brief summary of the candidate's resume or profile."),
  jobDescription: z.string().describe("The job description they are being considered for."),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type RolodexAnalysisInput = z.infer<typeof RolodexAnalysisInputSchema>;

export const RolodexAnalysisOutputSchema = z.object({
  fitScore: z.number().min(0).max(100).describe("An AI-generated score from 0-100 indicating the candidate's fit for the role."),
  icebreaker: z.string().describe("A concise, non-cringey opening line for an outreach email, based on their profile."),
  summary: z.string().describe("A one-sentence AI-generated summary of the candidate's key strength."),
});
export type RolodexAnalysisOutput = z.infer<typeof RolodexAnalysisOutputSchema>;
