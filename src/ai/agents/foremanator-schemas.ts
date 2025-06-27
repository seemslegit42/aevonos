import { z } from 'zod';

export const ForemanatorLogInputSchema = z.object({
  logText: z.string().describe('The raw, unstructured text of the daily log from the user.'),
});
export type ForemanatorLogInput = z.infer<typeof ForemanatorLogInputSchema>;

export const ForemanatorLogOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the day\'s activities.'),
  tasksCompleted: z.array(z.string()).describe('A list of specific tasks that were completed.'),
  materialsUsed: z.array(z.string()).describe('A list of materials that were used.'),
  blockers: z.array(z.string()).describe('A list of any blockers or issues encountered.'),
  foremanatorCommentary: z.string().describe('A motivational/insulting comment from The Foremanator.'),
});
export type ForemanatorLogOutput = z.infer<typeof ForemanatorLogOutputSchema>;
