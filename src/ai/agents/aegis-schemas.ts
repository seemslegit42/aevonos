import {z} from 'zod';

export const AegisAnomalyScanInputSchema = z.object({
  activityDescription: z
    .string()
    .describe('Description of user activity, including commands and data access.'),
});
export type AegisAnomalyScanInput = z.infer<typeof AegisAnomalyScanInputSchema>;

export const AegisAnomalyScanOutputSchema = z.object({
  isAnomalous: z.boolean().describe('Whether the activity is anomalous.'),
  anomalyExplanation: z
    .string()
    .describe('A clear, concise, and human-readable explanation of why the activity is considered anomalous. Frame it from the perspective of a vigilant security agent.'),
});
export type AegisAnomalyScanOutput = z.infer<typeof AegisAnomalyScanOutputSchema>;
