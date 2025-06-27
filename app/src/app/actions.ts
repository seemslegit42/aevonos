
'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { revalidatePath } from 'next/cache';
import { scanEvidence as scanEvidenceFlow, type PaperTrailScanInput, type PaperTrailScanOutput } from '@/ai/agents/paper-trail';
import { getServerActionSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function getCurrentUser() {
  const session = await getServerActionSession();
  if (!session?.userId) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      email: true,
      firstName: true,
      lastName: true,
    },
  });
  return user;
}

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
export async function scanEvidence(input: PaperTrailScanInput): Promise<PaperTrailScanOutput> {
  try {
    const result = await scanEvidenceFlow(input);
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
