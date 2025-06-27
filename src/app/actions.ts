'use server';

import { processUserCommand } from '@/ai/agents/beep';
import type { UserCommandOutput } from '@/ai/agents/beep-schemas';
import { aegisAnomalyScan } from '@/ai/agents/aegis';
import { revalidatePath } from 'next/cache';
import { drSyntaxCritique } from '@/ai/agents/dr-syntax';
import type { DrSyntaxInput, DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import { recallSession, type SessionRecallInput, type SessionRecallOutput } from '@/ai/agents/echo';
import { generatePamRant as generatePamRantFlow } from '@/ai/agents/pam-poovey';
import type { PamScriptInput, PamAudioOutput } from '@/ai/agents/pam-poovey-schemas';

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

export async function checkForAnomalies(activityDescription: string): Promise<{ isAnomalous: boolean; anomalyExplanation: string; }> {
    try {
        const result = await aegisAnomalyScan({ activityDescription });
        return result;
    } catch (error) {
        console.error('Error detecting anomalies:', error);
        return { isAnomalous: false, anomalyExplanation: "Error during scan." };
    }
}

export async function handleDrSyntaxCritique(input: DrSyntaxInput): Promise<DrSyntaxOutput> {
  try {
    const result = await drSyntaxCritique(input);
    return result;
  } catch (error) {
    console.error('Error in Dr. Syntax critique:', error);
    // Return a sarcastic error message in character
    return {
      critique: "I tried to process your request, but the sheer mediocrity of the input seems to have crashed my advanced systems. Or perhaps it was just a server error. It's hard to tell the difference with this level of input.",
      suggestion: "Try again, but with a modicum of effort this time.",
      rating: 1,
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

export async function generatePamRant(input: PamScriptInput): Promise<PamAudioOutput> {
  try {
    const result = await generatePamRantFlow(input);
    return result;
  } catch (error) {
    console.error('Error in Pam Poovey rant flow:', error);
    return {
      script: "I'd tell you what you need to know, but my glass is empty and so is my soul. Also, there was a server error.",
      audioDataUri: '',
    };
  }
}
