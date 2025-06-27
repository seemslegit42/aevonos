
import { z } from 'zod';

export const LaheyAnalysisInputSchema = z.object({
  logEntry: z.string().describe('A single log entry describing a staff event. e.g., "Kyle D. opened YouTube for 22 minutes."'),
});
export type LaheyAnalysisInput = z.infer<typeof LaheyAnalysisInputSchema>;

export const LaheyAnalysisOutputSchema = z.object({
  employee: z.string().describe("The name of the employee involved."),
  timestamp: z.string().datetime().describe("The ISO 8601 timestamp of the event."),
  event: z.string().describe("A brief description of the flagged event."),
  duration_minutes: z.number().optional().describe("The duration of the event in minutes, if applicable."),
  shitstorm_index: z.number().min(0).max(100).describe("An index from 0 to 100 indicating how close this event brings the office to a full-blown shitstorm."),
  lahey_commentary: z.string().describe("Jim Lahey's unique, liquor-fueled commentary on the event."),
});
export type LaheyAnalysisOutput = z.infer<typeof LaheyAnalysisOutputSchema>;
