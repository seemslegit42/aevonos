
'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { revalidatePath } from 'next/cache';
import { scanEvidence as scanEvidenceFlow, type PaperTrailScanInput, type PaperTrailScanOutput } from '@/ai/agents/paper-trail';
import { getServerActionSession } from '@/lib/auth';
import { createTransaction } from '@/services/ledger-service';
import { TransactionType, TransactionStatus } from '@prisma/client';
import prisma from '@/lib/prisma';
import { z } from 'zod';

export async function handleCommand(command: string): Promise<UserCommandOutput> {
  const session = await getServerActionSession();
  if (!session?.userId || !session?.workspaceId) {
    return {
        appsToLaunch: [],
        agentReports: [],
        suggestedCommands: ['Error: Unauthorized.'],
        responseText: 'Your session is invalid. Please log in again.'
    };
  }
  
  try {
    const result = await processUserCommand({ 
        userCommand: command,
        userId: session.userId,
        workspaceId: session.workspaceId,
    });
    revalidatePath('/');
    return result;
  } catch (error) {
    console.error('Error processing command:', error);
    return {
        appsToLaunch: [],
        agentReports: [],
        suggestedCommands: ['Error: Could not process command.'],
        responseText: 'My apologies, I encountered an internal error and could not process your command.'
    };
  }
}

// Keeping this as a specialized action due to the file upload requirement.
// The BEEP agent's text-based command stream is not suitable for high-bandwidth data.
export async function scanEvidence(input: Omit<PaperTrailScanInput, 'workspaceId'>): Promise<PaperTrailScanOutput> {
  const session = await getServerActionSession();
  if (!session?.workspaceId) {
      throw new Error("Unauthorized: No active session found.");
  }
  
  try {
    const result = await scanEvidenceFlow({...input, workspaceId: session.workspaceId });
    revalidatePath('/');
    return result;
  } catch (error) {
    console.error('Error in Paper Trail scan:', error);
    return {
      vendor: 'Error',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      lead: "The informant is offline. Couldn't process the evidence.",
      isEvidenceValid: false,
    };
  }
}

export async function purchaseCredits(amount: number) {
  const session = await getServerActionSession();
  if (!session?.userId || !session?.workspaceId) {
    return { success: false, error: 'Unauthorized' };
  }

  if (amount <= 0) {
    return { success: false, error: 'Invalid credit amount.' };
  }

  try {
    await createTransaction({
      workspaceId: session.workspaceId,
      userId: session.userId,
      type: TransactionType.CREDIT,
      amount,
      description: `Manual credit purchase of ${amount.toLocaleString()}`,
    });

    revalidatePath('/');
    return { success: true, message: `${amount.toLocaleString()} credits added successfully.` };
  } catch (error) {
    console.error('[Action: purchaseCredits]', error);
    return { success: false, error: 'Failed to add credits.' };
  }
}

const TopUpRequestSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than zero." }),
});

export async function requestCreditTopUp(formData: FormData) {
    const session = await getServerActionSession();
    if (!session?.userId || !session?.workspaceId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const validatedFields = TopUpRequestSchema.safeParse({
        amount: formData.get('amount'),
    });

    if (!validatedFields.success) {
        return {
          success: false,
          error: validatedFields.error.flatten().fieldErrors.amount?.[0] || 'Invalid amount.',
        };
    }

    const { amount } = validatedFields.data;

    try {
        await prisma.transaction.create({
            data: {
                workspaceId: session.workspaceId,
                userId: session.userId,
                type: TransactionType.CREDIT,
                status: TransactionStatus.PENDING,
                amount: amount,
                description: `User-initiated e-Transfer top-up request for ${amount.toLocaleString()} credits.`,
            }
        });
        revalidatePath('/');
        return { success: true, message: `Your request for ${amount.toLocaleString()} credits has been logged. Credits will be applied upon payment confirmation.` };
    } catch (e) {
        console.error('[Action: requestCreditTopUp]', e);
        return { success: false, error: 'Failed to log your top-up request.' };
    }
}
