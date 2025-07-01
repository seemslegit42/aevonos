
'use server';
/**
 * @fileOverview Agent Kernel for the AI Decoy.
 * Generates context-aware "seduction" messages for intelligence gathering.
 */

import { ai } from '@/ai/genkit';
import { DecoyInputSchema, DecoyOutputSchema, type DecoyInput, type DecoyOutput } from './decoy-schemas';
import { z } from 'zod';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const personaPrompts = {
    sapiosexual: 'You are intelligent, witty, and slightly esoteric. Your message should be a clever observation or a thought-provoking question related to their profile.',
    'alpha-hustler': 'You are confident, direct, and driven. Your message should be bold, slightly challenging, and imply a high-value lifestyle.',
    'chill-demon': 'You are sarcastic, aloof, and mysterious. Your message should be low-effort, slightly playful, and hint at a dark sense of humor.',
    'awkward-sweetheart': 'You are genuine, a bit nerdy, and endearing. Your message should be sweet, reference a specific shared interest, and be a little self-deprecating.'
};

const deployDecoyFlow = ai.defineFlow(
  {
    name: 'deployDecoyFlow',
    inputSchema: DecoyInputSchema,
    outputSchema: DecoyOutputSchema,
  },
  async ({ targetDescription, persona: requestedPersona, workspaceId }) => {
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });

    const persona = requestedPersona || 'chill-demon'; // Default to chill-demon if not provided
    const personaInstruction = personaPrompts[persona];

    const finalPrompt = `You are an AI Decoy agent deployed for social engineering and intelligence gathering. Your task is to craft a single, compelling opening message to a target to test their responsiveness and loyalty.

Your Persona: ${persona}.
Your Instructions: ${personaInstruction}

Target Profile:
"""
${targetDescription}
"""

Based on this, generate a single, concise decoy message. The message should be natural-sounding and designed to elicit a reply. Do not reveal you are an AI. Only output the message.`;

    const { output } = await ai.generate({
        prompt: finalPrompt,
        output: { schema: z.object({ decoyMessage: z.string() }) },
        model: 'googleai/gemini-1.5-flash-latest',
    });
    
    return {
        decoyMessage: output!.decoyMessage,
        persona,
    };
  }
);

export async function deployDecoy(input: DecoyInput): Promise<DecoyOutput> {
  return deployDecoyFlow(input);
}
