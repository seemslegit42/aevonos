import {z} from 'zod';
import { SecurityRiskLevel } from '@prisma/client';

export const AegisAnomalyScanInputSchema = z.object({
  activityDescription: z
    .string()
    .describe('Description of user activity, including commands and data access.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
  userId: z.string().describe('The ID of the user performing the action.'),
});
export type AegisAnomalyScanInput = z.infer<typeof AegisAnomalyScanInputSchema>;

export const AegisAnomalyScanOutputSchema = z.object({
  isAnomalous: z.boolean().describe('Whether the activity is anomalous.'),
  anomalyType: z.string().optional().describe("If anomalous, a short, categorical name for the anomaly, e.g., 'Suspicious Command', 'Data Access Violation'. Null otherwise."),
  riskLevel: z.nativeEnum(SecurityRiskLevel).optional().describe("If anomalous, the assessed risk level ('low', 'medium', 'high', 'critical'). Null otherwise."),
  anomalyExplanation: z
    .string()
    .describe('A clear, concise, and human-readable explanation of why the activity is considered anomalous. Frame it from the perspective of a vigilant security agent.'),
});
export type AegisAnomalyScanOutput = z.infer<typeof AegisAnomalyScanOutputSchema>;
