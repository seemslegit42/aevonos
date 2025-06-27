'use server';
/**
 * @fileOverview Agent Kernel for the BEEP Wingman.
 * Generates compelling opening messages for dating apps.
 */

import { ai } from '@/ai/genkit';
import { WingmanInputSchema, WingmanOutputSchema, type WingmanInput, type WingmanOutput } from './wingman-schemas';

const personaPrompts = {
    sapiosexual: 'You are intelligent, witty, and slightly esoteric. Your message should be a clever observation or a thought-provoking question related to their profile that showcases your intellect.',
    'alpha-hustler': 'You are confident, direct, and driven. Your message should be bold, slightly challenging, and imply a high-value lifestyle without being arrogant.',
    'chill-demon': 'You are sarcastic, aloof, and mysterious. Your message should be low-effort, slightly playful, and hint at a dark sense of humor. Make them curious.',
    'awkward-sweetheart': 'You are genuine, a bit nerdy, and endearing. Your message should be sweet, reference a specific shared interest, and be a little self-deprecating to show you don\'t take yourself too seriously.'
};

const generateWingmanMessageFlow = ai.defineFlow(
  {
    name: 'generateWingmanMessageFlow',
    inputSchema: WingmanInputSchema,
    outputSchema: WingmanOutputSchema,
  },
  async ({ targetDescription, persona }) => {
    const personaInstruction = personaPrompts[persona];

    const finalPrompt = `You are BEEP's Wingman, an AI agent that helps write compelling opening messages for dating apps. Your goal is to start a genuine conversation, not to deceive.

Your Persona: ${persona}.
Your Instructions: ${personaInstruction}

Target Profile Description:
"""
${targetDescription}
"""

Based on this, generate a single, concise opening message. The message should be natural-sounding and designed to elicit a reply. Only output the message.`;

    const { output } = await ai.generate({
        prompt: finalPrompt,
        output: { schema: WingmanOutputSchema },
        model: 'googleai/gemini-2.0-flash',
    });
    
    return output!;
  }
);

export async function generateWingmanMessage(input: WingmanInput): Promise<WingmanOutput> {
  return generateWingmanMessageFlow(input);
}
