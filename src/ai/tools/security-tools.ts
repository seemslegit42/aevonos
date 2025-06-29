
'use server';
/**
 * @fileOverview Tool for creating security alerts.
 */
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { 
    CreateSecurityAlertInputSchema,
    SecurityAlertSchema,
    type CreateSecurityAlertInput, 
    type SecurityAlert, 
} from './security-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const createSecurityAlertFlow = ai.defineFlow(
  {
    name: 'createSecurityAlertFlow',
    inputSchema: CreateSecurityAlertInputSchema.extend({ workspaceId: z.string() }),
    outputSchema: SecurityAlertSchema,
  },
  async (input) => {
    // Creating a security alert is a significant action.
    await authorizeAndDebitAgentActions(input.workspaceId);
    try {
      const { workspaceId, ...alertData } = input;
      const alert = await prisma.securityAlert.create({
        data: {
          ...alertData,
          actionableOptions: ['Lock Account', 'Dismiss Alert', 'View Details'],
          workspaceId,
        },
      });
      return alert;
    } catch (error) {
      console.error('[Security Tool Error] Failed to create security alert:', error);
      throw new Error('Failed to create the security alert in the database.');
    }
  }
);

export async function createSecurityAlertInDb(input: CreateSecurityAlertInput, workspaceId: string): Promise<SecurityAlert> {
    return createSecurityAlertFlow({ ...input, workspaceId });
}
