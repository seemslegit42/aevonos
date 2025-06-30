
'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { revalidatePath } from 'next/cache';
import { scanEvidence as scanEvidenceFlow, type PaperTrailScanInput, type PaperTrailScanOutput } from '@/ai/agents/paper-trail';
import { getServerActionSession } from '@/lib/auth';
import { processMicroAppPurchase } from '@/services/ledger-service';
import { z } from 'zod';
import { requestCreditTopUpInDb } from '@/services/billing-service';
import { microAppManifests } from '@/config/micro-apps';
import { chaosCardManifest } from '@/config/chaos-cards';
import { processChaosCardTribute } from '@/services/klepsydra-service';
import { InsufficientCreditsError } from '@/lib/errors';
import { acceptReclamationGift } from './auth/actions';


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
  
  if (command.toLowerCase().trim() === 'the tendies are coming') {
    return {
        appsToLaunch: [{ type: 'stonks-bot', title: 'STONKSBOT 9000 (POSSESSED)' }],
        agentReports: [],
        suggestedCommands: [],
        responseText: 'Brace. The Greed Index is unstable.'
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { psyche: true }
  });

  if (!user) {
    return {
        appsToLaunch: [],
        agentReports: [],
        suggestedCommands: ['Error: User not found.'],
        responseText: 'Could not identify the active user.'
    };
  }
  
  try {
    const result = await processUserCommand({ 
        userCommand: command,
        userId: session.userId,
        workspaceId: session.workspaceId,
        psyche: user.psyche,
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

export async function purchaseMicroApp(appId: string) {
  const session = await getServerActionSession();
  if (!session?.userId || !session?.workspaceId) {
    return { success: false, error: 'Unauthorized' };
  }

  const appManifest = microAppManifests.find(app => app.id === appId);
  if (!appManifest) {
    return { success: false, error: 'Micro-App not found.' };
  }

  if (appManifest.creditCost <= 0) {
    return { success: false, error: 'This app cannot be purchased.' };
  }

  try {
    await processMicroAppPurchase(
        session.userId, 
        session.workspaceId, 
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


export async function purchaseChaosCard(cardKey: string) {
  const session = await getServerActionSession();
  if (!session?.userId || !session?.workspaceId) {
    return { success: false, error: 'Unauthorized' };
  }

  const cardManifest = chaosCardManifest.find(card => card.key === cardKey);
  if (!cardManifest) {
    return { success: false, error: 'Chaos Card not found in manifest.' };
  }
  
  try {
    const { outcome, boonAmount } = await processChaosCardTribute(
        session.userId, 
        session.workspaceId, 
        cardKey
    );
    
    revalidatePath('/');
    
    if (outcome === 'win' || outcome === 'pity_boon') {
        return { 
            success: true, 
            outcome, 
            message: `Tribute successful! Acquired ${cardManifest.name}. You were granted a boon of ${boonAmount.toFixed(2)} Ξ.` 
        };
    } else { // loss
        return {
            success: true,
            outcome,
            message: `The tribute was not enough. ${cardManifest.name} slips through your fingers.`
        };
    }

  } catch (error) {
    console.error(`[Action: purchaseChaosCard] for card ${cardKey}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete tribute.';
    return { success: false, error: errorMessage };
  }
}

export async function logInstrumentDiscovery(instrumentId: string) {
  const session = await getServerActionSession();
  if (!session?.userId || !session?.workspaceId) {
    return;
  }

  try {
    const existingDiscovery = await prisma.instrumentDiscovery.findFirst({
      where: {
        userId: session.userId,
        instrumentId,
      },
    });

    if (!existingDiscovery) {
      await prisma.instrumentDiscovery.create({
        data: {
          userId: session.userId,
          workspaceId: session.workspaceId,
          instrumentId,
        },
      });
    }
  } catch (error) {
    console.error(`[Action: logInstrumentDiscovery] for instrument ${instrumentId}:`, error);
  }
}

export async function getNudges() {
  const session = await getServerActionSession();
  if (!session?.userId) {
    return [];
  }

  const twelveMinutesAgo = new Date(Date.now() - 12 * 60 * 1000);

  const ripeDiscoveries = await prisma.instrumentDiscovery.findMany({
    where: {
      userId: session.userId,
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

  const allInstruments = [...microAppManifests, ...chaosCardManifest];
  const instrumentMap = new Map(allInstruments.map(i => [i.id || i.key, i.name]));
  
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
