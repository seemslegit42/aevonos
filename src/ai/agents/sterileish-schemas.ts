import { z } from 'zod';

export const SterileishAnalysisInputSchema = z.object({
  logText: z.string().describe('The raw text from a cleanroom log entry, like temperature readings, cleaning validation, or equipment calibration.'),
  entryType: z.enum(['environment', 'calibration', 'cleaning', 'general'])
    .describe('The type of log entry being submitted for analysis.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type SterileishAnalysisInput = z.infer<typeof SterileishAnalysisInputSchema>;

export const SterileishAnalysisOutputSchema = z.object({
  isCompliant: z.boolean().describe('Whether the log entry appears to be compliant with standard procedures.'),
  complianceNotes: z.string().describe('A brief, slightly sarcastic note on why the entry is or is not compliant.'),
  sterileRating: z.number().min(0).max(10).describe('A rating from 0-10 on the "sterility" of the situation, where 10 is "almost too clean, bro."'),
  snarkySummary: z.string().describe('A one-line, snarky summary suitable for an audit report header. e.g., "Everything’s clean, Janet. Even your attitude."'),
});
export type SterileishAnalysisOutput = z.infer<typeof SterileishAnalysisOutputSchema>;
