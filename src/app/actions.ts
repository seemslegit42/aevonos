
'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { revalidatePath } from 'next/cache';
import { scanEvidence as scanEvidenceFlow, type PaperTrailScanInput, type PaperTrailScanOutput } from '@/ai/agents/paper-trail';
import { getServerActionSession } from '@/lib/auth';
import { createTransaction, confirmPendingTransaction } from '@/services/ledger-service';
import { TransactionType } from '@prisma/client';
import { z } from 'zod';
import { requestCreditTopUpInDb } from '@/ai/tools/billing-tools';
import { microAppManifests } from '@/config/micro-apps';
import { chaosCardManifest } from '@/config/chaos-cards';
import prisma from '@/lib/prisma';


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

export async function requestCreditTopUp(amount: number) {
    const session = await getServerActionSession();
    if (!session?.userId || !session?.workspaceId) {
      return { success: false, error: 'Unauthorized' };
    }
    
    const validatedFields = TopUpRequestSchema.safeParse({ amount });

    if (!validatedFields.success) {
        return {
          success: false,
          error: validatedFields.error.flatten().fieldErrors.amount?.[0] || 'Invalid amount.',
        };
    }

    const { amount: validatedAmount } = validatedFields.data;

    // Call the centralized tool logic
    const result = await requestCreditTopUpInDb({ amount: validatedAmount }, session.userId, session.workspaceId);
    
    if (result.success) {
        revalidatePath('/');
    }

    return result;
}

export async function confirmEtransfer(transactionId: string) {
  const session = await getServerActionSession();
  if (!session?.userId || !session?.workspaceId) {
    return { success: false, error: 'Unauthorized' };
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (user?.role !== 'ADMIN') {
    return { success: false, error: 'Permission denied. Administrator access required.' };
  }

  try {
    await confirmPendingTransaction(transactionId, session.workspaceId);
    revalidatePath('/'); // Revalidates the page to show updated balance and status
    return { success: true };
  } catch (error) {
    console.error('[Action: confirmEtransfer]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to confirm transaction.' };
  }
}

export async function purchaseMicroApp(appId: string) {
  const session = await getServerActionSession();
  if (!session?.userId || !session?.workspaceId) {
    return { success: false, error: 'Unauthorized' };
  }

  const appManifest = microAppManifests.find(app => app.id === appId);
  if (!appManifest) {
    return { success: false, error: 'Micro-App not found.' };
  }

  const { creditCost, name } = appManifest;
  if (creditCost <= 0) {
    return { success: false, error: 'This app cannot be purchased.' };
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: session.workspaceId },
    });

    if (!workspace) {
      return { success: false, error: 'Workspace not found.' };
    }

    if ((workspace.credits as unknown as number) < creditCost) {
      return { success: false, error: 'Insufficient ΞCredits.' };
    }
    
    if (workspace.unlockedAppIds.includes(appId)) {
      return { success: false, error: 'App already unlocked.' };
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Debit the credits by creating a transaction which in turn updates the balance
      await createTransaction({
        workspaceId: session.workspaceId,
        userId: session.userId,
        type: TransactionType.DEBIT,
        amount: creditCost,
        description: `Micro-App Unlock: ${name}`,
      });

      // 2. Add the app to the unlocked list
      await tx.workspace.update({
        where: { id: session.workspaceId },
        data: {
          unlockedAppIds: {
            push: appId,
          },
        },
      });
    });

    revalidatePath('/'); // Revalidate to reflect changes across the app
    return { success: true, message: `Successfully unlocked ${name}!` };

  } catch (error) {
    console.error(`[Action: purchaseMicroApp] for app ${appId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete purchase.';
    return { success: false, error: errorMessage };
  }
}


export async function purchaseChaosCard(cardKey: string) {
  const session = await getServerActionSession();
  if (!session?.userId || !session?.workspaceId) {
    return { success: false, error: 'Unauthorized' };
  }

  const cardManifest = chaosCardManifest.find(card => card.key === cardKey);
  if (!cardManifest) {
    return { success: false, error: 'Chaos Card not found in manifest.' };
  }

  const { cost, name } = cardManifest;

  try {
    // We need both the user and the workspace in this transaction
    const [user, workspace] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        include: { ownedChaosCards: { select: { key: true } } }
      }),
      prisma.workspace.findUnique({
        where: { id: session.workspaceId },
      }),
    ]);
    
    if (!user || !workspace) {
      return { success: false, error: 'User or Workspace not found.' };
    }

    if (user.ownedChaosCards.some(card => card.key === cardKey)) {
      return { success: false, error: 'Card already owned.' };
    }

    if ((workspace.credits as unknown as number) < cost) {
      return { success: false, error: 'Insufficient ΞCredits.' };
    }

    const cardInDb = await prisma.chaosCard.findUnique({ where: { key: cardKey } });
    if (!cardInDb) {
      return { success: false, error: 'Card does not exist in the database.' };
    }

    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Debit the credits from the workspace by creating a transaction
      await createTransaction({
        workspaceId: session.workspaceId,
        userId: session.userId,
        type: TransactionType.DEBIT,
        amount: cost,
        description: `Chaos Card Acquired: ${name}`,
      });

      // 2. Add the card to the user's collection
      await tx.user.update({
        where: { id: session.userId },
        data: {
          ownedChaosCards: {
            connect: { id: cardInDb.id },
          },
        },
      });
    });

    revalidatePath('/'); // Revalidate to reflect changes
    return { success: true, message: `Successfully acquired ${name}!` };

  } catch (error) {
    console.error(`[Action: purchaseChaosCard] for card ${cardKey}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete purchase.';
    return { success: false, error: errorMessage };
  }
}
