
'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { revalidatePath } from 'next/cache';
import { recallSession, type SessionRecallInput, type SessionRecallOutput } from '@/ai/agents/echo';


export async function handleCommand(command: string): Promise<UserCommandOutput> {
  try {
    const result = await processUserCommand({ userCommand: command });
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

export async function recallSessionAction(input: SessionRecallInput): Promise<SessionRecallOutput> {
  try {
    const result = await recallSession(input);
    return result;
  } catch (error) {
    console.error('Error in Echo recall:', error);
    return {
      summary: "I tried to remember what happened, but the memory is fuzzy. There might have been a system error.",
      keyPoints: ["Could not retrieve session details."],
    };
  }
}
