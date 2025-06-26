'use server';

import { generateInitialPrompts } from '@/ai/flows/initial-prompt-generation';
import { detectAnomalies } from '@/ai/flows/anomaly-detection';
import { revalidatePath } from 'next/cache';

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
