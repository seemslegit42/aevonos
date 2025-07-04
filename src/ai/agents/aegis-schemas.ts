
import {z} from 'zod';
import { SecurityRiskLevel, UserRole, UserPsyche, PulsePhase, PulseInteractionType } from '@prisma/client';

// Define a Zod schema for the PulseProfile to use in other schemas
export const PulseProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amplitude: z.number(),
  frequency: z.number(),
  phaseOffset: z.number(),
  baselineLuck: z.number(),
  lastEventTimestamp: z.date(),
  consecutiveLosses: z.number().int(),
  lastResolvedPhase: z.nativeEnum(PulsePhase).optional().nullable(),
  lastInteractionType: z.nativeEnum(PulseInteractionType).optional().nullable(),
  frustration: z.number(),
  flowState: z.number(),
  riskAversion: z.number(),
  nextTributeGuaranteedWin: z.boolean().optional().nullable(),
  loadedDieBuffCount: z.number().int().optional().nullable(),
  hadesBargainActive: z.boolean().optional().nullable(),
}).partial(); // Use partial as we may not pass all fields
export type PulseProfileInput = z.infer<typeof PulseProfileSchema>;

export const AegisAnomalyScanInputSchema = z.object({
  activityDescription: z
    .string()
    .describe('Description of user activity, including commands and data access.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
  userId: z.string().describe('The ID of the user performing the action.'),
  userRole: z.nativeEnum(UserRole).describe("The role of the user performing the action (e.g., ADMIN, OPERATOR)."),
  userPsyche: z.nativeEnum(UserPsyche).describe("The psychological profile of the user."),
  pulseProfile: PulseProfileSchema.optional().describe("The user's current psychological state from their Pulse Profile."),
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
