
'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { revalidatePath } from 'next/cache';
import { scanEvidence as scanEvidenceFlow, type PaperTrailScanInput, type PaperTrailScanOutput } from '@/ai/agents/paper-trail';
import { getServerActionSession } from '@/lib/auth';
import { processMicroAppPurchase } from '@/services/ledger-service';
import { z } from 'zod';
import { requestCreditTopUpInDb } from '@/services/billing-service';
import { artifactManifests } from '@/config/artifacts';
import { InsufficientCreditsError } from '@/lib/errors';
import { acceptReclamationGift, deleteAccount, logout } from './auth/actions';
import { processFollyTribute } from '@/services/klepsydra-service';
import prisma from '@/lib/prisma';


export async function handleCommand(command: string): Promise<UserCommandOutput> {
  const sessionUser = await getServerActionSession();
  
  if (command.toLowerCase().trim() === 'the tendies are coming') {
    return {
        appsToLaunch: [{ type: 'stonks-bot', title: 'STONKSBOT 9000 (POSSESSED)' }],
        agentReports: [],
        suggestedCommands: [],
        responseText: 'Brace. The Greed Index is unstable.'
    };
  }

  try {
    const result = await processUserCommand({ 
        userCommand: command,
        userId: sessionUser.id,
        workspaceId: sessionUser.workspaceId,
        psyche: sessionUser.psyche,
        role: sessionUser.role,
    });
    revalidatePath('/');
    return result;
  } catch (error) {
    console.error('Error processing command:', error);
    const errorMessage = error instanceof InsufficientCreditsError 
        ? error.message 
        : 'My apologies, I encountered an internal error and could not process your command.';
    
    return {
        appsToLaunch: [],
        agentReports: [],
        suggestedCommands: ['Error: Could not process command.'],
        responseText: errorMessage
    };
  }
}

// Keeping this as a specialized action due to the file upload requirement.
// The BEEP agent's text-based command stream is not suitable for high-bandwidth data.
export async function scanEvidence(input: Omit<PaperTrailScanInput, 'workspaceId' | 'userId'>): Promise<PaperTrailScanOutput> {
  const sessionUser = await getServerActionSession();
  
  try {
    const result = await scanEvidenceFlow({...input, workspaceId: sessionUser.workspaceId });
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

const TopUpRequestSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be greater than zero." }),
});

export async function requestCreditTopUp(amount: number) {
    const sessionUser = await getServerActionSession();
    
    const validatedFields = TopUpRequestSchema.safeParse({ amount });

    if (!validatedFields.success) {
        return {
          success: false,
          error: validatedFields.error.flatten().fieldErrors.amount?.[0] || 'Invalid amount.',
        };
    }

    const { amount: validatedAmount } = validatedFields.data;

    // Call the centralized tool logic
    const result = await requestCreditTopUpInDb({ amount: validatedAmount }, sessionUser.id, sessionUser.workspaceId);
    
    if (result.success) {
        revalidatePath('/');
    }

    return result;
}

export async function purchaseMicroApp(appId: string) {
  const sessionUser = await getServerActionSession();

  const appManifest = artifactManifests.find(artifact => artifact.id === appId && artifact.type === 'MICRO_APP');
  if (!appManifest) {
    return { success: false, error: 'Micro-App not found.' };
  }

  if (appManifest.creditCost <= 0) {
    return { success: false, error: 'This app cannot be purchased.' };
  }

  try {
    await processMicroAppPurchase(
        sessionUser.id, 
        sessionUser.workspaceId, 
        appId, 
        appManifest.name, 
        appManifest.creditCost
    );

    revalidatePath('/'); // Revalidate to reflect changes across the app
    return { success: true, message: `Successfully unlocked ${appManifest.name}!` };

  } catch (error) {
    console.error(`[Action: purchaseMicroApp] for app ${appId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete purchase.';
    return { success: false, error: errorMessage };
  }
}

export async function makeFollyTribute(instrumentId: string, tributeAmount?: number) {
  const sessionUser = await getServerActionSession();
  
  try {
    const { outcome, boonAmount } = await processFollyTribute(
        sessionUser.id, 
        sessionUser.workspaceId, 
        instrumentId,
        tributeAmount,
    );
    
    revalidatePath('/');
    
    let message: string;
    const isLoss = outcome === 'common' || outcome === 'loss';

    if (outcome === 'pity_boon') {
        message = `The Obelisk acknowledges your persistence. A minor alignment of fate has granted you a boon of ${boonAmount.toFixed(2)} Ξ.`;
    } else if (!isLoss) {
        message = `The tribute was accepted. You have been granted a boon of ${boonAmount.toFixed(2)} Ξ.`;
    } else {
        message = `The tribute was not enough. The threads of fate were not in your favor.`;
    }

    return {
        success: true,
        outcome,
        boonAmount,
        message,
    };

  } catch (error) {
    console.error(`[Action: makeFollyTribute] for instrument ${instrumentId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete tribute.';
    return { success: false, error: errorMessage };
  }
}


export async function logInstrumentDiscovery(instrumentId: string) {
  const sessionUser = await getServerActionSession();

  try {
    const existingDiscovery = await prisma.instrumentDiscovery.findFirst({
      where: {
        userId: sessionUser.id,
        instrumentId,
      },
    });

    if (!existingDiscovery) {
      await prisma.instrumentDiscovery.create({
        data: {
          userId: sessionUser.id,
          workspaceId: sessionUser.workspaceId,
          instrumentId,
        },
      });
    }
  } catch (error) {
    console.error(`[Action: logInstrumentDiscovery] for instrument ${instrumentId}:`, error);
  }
}

export async function getNudges() {
  const sessionUser = await getServerActionSession();

  const twelveMinutesAgo = new Date(Date.now() - 12 * 60 * 1000);

  const ripeDiscoveries = await prisma.instrumentDiscovery.findMany({
    where: {
      userId: sessionUser.id,
      converted: false,
      firstViewedAt: {
        lt: twelveMinutesAgo,
      },
      nudgeSentAt: null,
    },
  });
  
  if (ripeDiscoveries.length === 0) {
      return [];
  }

  const allInstruments = artifactManifests;
  const instrumentMap = new Map(allInstruments.map(i => [i.id, i.name]));
  
  const nudges = ripeDiscoveries.map(discovery => {
      const instrumentName = instrumentMap.get(discovery.instrumentId) || 'a forgotten artifact';
      return {
          message: `A strange energy coalesces around the ${instrumentName}. It warrants investigation.`
      }
  });

  await prisma.instrumentDiscovery.updateMany({
      where: {
          id: {
              in: ripeDiscoveries.map(d => d.id)
          }
      },
      data: {
          nudgeSentAt: new Date()
      }
  });

  return nudges;
}

export async function handleAcceptReclamationGift(): Promise<{ success: boolean; error?: string }> {
  return acceptReclamationGift();
}

export async function handleLogout() {
  await logout();
}

export async function handleDeleteAccount() {
  await deleteAccount();
}

export async function clearFirstWhisper() {
  const sessionUser = await getServerActionSession();
  try {
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { firstWhisper: null },
    });
  } catch (error) {
    console.error(`[Action: clearFirstWhisper] for user ${sessionUser.id}:`, error);
  }
}
