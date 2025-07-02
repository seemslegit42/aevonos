
'use server';
/**
 * @fileOverview Tool for creating security alerts.
 */
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { 
    CreateSecurityAlertInputSchema,
    SecurityAlertSchema,
    type CreateSecurityAlertInput, 
    type SecurityAlert, 
} from './security-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';


export async function createSecurityAlertInDb(input: CreateSecurityAlertInput, workspaceId: string, userId: string): Promise<SecurityAlert> {
    // Creating a security alert is a significant action.
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'TOOL_USE' });
    try {
      const { ...alertData } = input;
      const alert = await prisma.securityAlert.create({
        data: {
          ...alertData,
          actionableOptions: ['Lock Account', 'Dismiss Alert', 'View Details'],
          workspaceId,
          userId,
        },
      });
      return alert;
    } catch (error) {
      console.error('[Security Tool Error] Failed to create security alert:', error);
      throw new Error('Failed to create the security alert in the database.');
    }
}



    