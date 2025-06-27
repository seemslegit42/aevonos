'use server';

import { generateInitialPrompts } from '@/ai/flows/initial-prompt-generation';
import { detectAnomalies } from '@/ai/flows/anomaly-detection';
import { revalidatePath } from 'next/cache';
import { drSyntaxCritique, type DrSyntaxInput, type DrSyntaxOutput } from '@/ai/agents/dr-syntax';

export async function handleCommand(command: string): Promise<string[]> {
  try {
    const result = await generateInitialPrompts({ userDescription: command });
    revalidatePath('/');
    return result.suggestedCommands;
  } catch (error) {
    console.error('Error generating initial prompts:', error);
    return ['Error: Could not process command.'];
  }
}

export async function checkForAnomalies(activityDescription: string): Promise<{ isAnomalous: boolean; anomalyExplanation: string; }> {
    try {
        const result = await detectAnomalies({ activityDescription });
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
