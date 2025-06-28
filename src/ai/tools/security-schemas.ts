import { z } from 'zod';
import { SecurityRiskLevel } from '@prisma/client';

export const SecurityAlertSchema = z.object({
  id: z.string(),
  type: z.string(),
  explanation: z.string(),
  riskLevel: z.nativeEnum(SecurityRiskLevel),
  timestamp: z.date().or(z.string()),
  actionableOptions: z.array(z.string()),
  workspaceId: z.string(),
});
export type SecurityAlert = z.infer<typeof SecurityAlertSchema>;

export const CreateSecurityAlertInputSchema = z.object({
  type: z.string().describe("The type of security alert (e.g., 'Anomalous Command', 'Suspicious Activity')."),
  explanation: z.string().describe("The plain English explanation of the alert, provided by Aegis."),
  riskLevel: z.nativeEnum(SecurityRiskLevel).describe("The risk level of the event: 'low', 'medium', 'high', or 'critical'."),
});
export type CreateSecurityAlertInput = z.infer<typeof CreateSecurityAlertInputSchema>;
