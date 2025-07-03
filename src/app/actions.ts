
'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { revalidatePath } from 'next/cache';
import { scanEvidence as scanEvidenceFlow, type PaperTrailScanInput, type PaperTrailScanOutput } from '@/ai/agents/paper-trail';
import { getAuthenticatedUser } from '@/lib/firebase/admin';
import { processMicroAppPurchase, transmuteCredits } from '@/services/ledger-service';
import { TransmuteCreditsInputSchema } from '@/ai/tools/ledger-schemas';
import { z } from 'zod';
import { requestCreditTopUpInDb } from '@/services/billing-service';
import { artifactManifests } from '@/config/artifacts';
import { InsufficientCreditsError } from '@/lib/errors';
import { acceptReclamationGift, deleteAccount } from '@/app/auth/actions';
import { processFollyTribute } from '@/services/klepsydra-service';
import prisma from '@/lib/prisma';


export async function handleCommand(command: string, activeAppContext?: string): Promise<UserCommandOutput> {
  const { user, workspace } = await getAuthenticatedUser();
  
  if (!user || !workspace) {
    throw new Error('User or workspace not found. Onboarding may be incomplete.');
  }

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
        userId: user.id,
        workspaceId: workspace.id,
        psyche: user.psyche,
        role: user.role,
        activeAppContext,
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
  const { workspace } = await getAuthenticatedUser();
  if (!workspace) {
      throw new Error('Workspace not found.');
  }
  
  try {
    const result = await scanEvidenceFlow({...input, workspaceId: workspace.id });
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
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace) {
        return { success: false, error: 'User or workspace not found.' };
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
    const result = await requestCreditTopUpInDb({ amount: validatedAmount }, user.id, workspace.id);
    
    if (result.success) {
        revalidatePath('/');
    }

    return result;
}

export async function purchaseMicroApp(appId: string) {
  const { user, workspace } = await getAuthenticatedUser();
   if (!user || !workspace) {
        return { success: false, error: 'User or workspace not found.' };
    }

  const appManifest = artifactManifests.find(artifact => artifact.id === appId && artifact.type === 'MICRO_APP');
  if (!appManifest) {
    return { success: false, error: 'Micro-App not found.' };
  }

  if (appManifest.creditCost <= 0) {
    return { success: false, error: 'This app cannot be purchased.' };
  }

  try {
    await processMicroAppPurchase(
        user.id, 
        workspace.id, 
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
  const { user, workspace } = await getAuthenticatedUser();
   if (!user || !workspace) {
        return { success: false, error: 'User or workspace not found.' };
    }
  
  try {
    const { outcome, boonAmount, aethericEcho } = await processFollyTribute(
        user.id, 
        workspace.id, 
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
        aethericEcho,
    };

  } catch (error) {
    console.error(`[Action: makeFollyTribute] for instrument ${instrumentId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to complete tribute.';
    return { success: false, error: errorMessage };
  }
}

export async function transmuteCreditsViaProxy(input: z.infer<typeof TransmuteCreditsInputSchema>) {
    const { user, workspace } = await getAuthenticatedUser();
    if (!user || !workspace) {
        return { success: false, error: 'Authentication failed.' };
    }
    if (user.id !== workspace.ownerId) {
        return { success: false, error: 'Forbidden: Only the workspace Architect can perform transmutations.' };
    }
    
    try {
        const result = await transmuteCredits(input, workspace.id, user.id);
        revalidatePath('/'); // Revalidate to update credit balance
        return { ...result };
    } catch (error) {
        const errorMessage = error instanceof InsufficientCreditsError ? error.message : 'Transmutation failed.';
        return { success: false, error: errorMessage };
    }
}


export async function logInstrumentDiscovery(instrumentId: string) {
  const { user, workspace } = await getAuthenticatedUser();
   if (!user || !workspace) {
        return; // Fail silently
    }

  try {
    const existingDiscovery = await prisma.instrumentDiscovery.findFirst({
      where: {
        userId: user.id,
        instrumentId,
      },
    });

    if (!existingDiscovery) {
      await prisma.instrumentDiscovery.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          instrumentId,
        },
      });
    }
  } catch (error) {
    console.error(`[Action: logInstrumentDiscovery] for instrument ${instrumentId}:`, error);
  }
}

export async function getNudges() {
  const { user } = await getAuthenticatedUser();
  if (!user) return [];

  const twelveMinutesAgo = new Date(Date.now() - 12 * 60 * 1000);

  const ripeDiscoveries = await prisma.instrumentDiscovery.findMany({
    where: {
      userId: user.id,
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
export async function clearFirstWhisper() {
  const { user } = await getAuthenticatedUser();
  if (!user) return;
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        firstWhisper: null,
        firstCommand: null,
      },
    });
  } catch (error) {
    console.error(`[Action: clearFirstWhisper] for user ${user.id}:`, error);
  }
}
