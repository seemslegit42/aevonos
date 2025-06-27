'use server';
/**
 * @fileOverview Agent Kernel for the BEEP Wingman.
 * Generates compelling opening messages for dating apps.
 */

import { ai } from '@/ai/genkit';
import { WingmanInputSchema, WingmanOutputSchema, type WingmanInput, type WingmanOutput } from './wingman-schemas';

const personaPrompts = {
    sapiosexual: 'You are intelligent, witty, and slightly esoteric. Your message should be a clever observation or a thought-provoking question related to their profile that showcases your intellect. Think "Turing-Tested Seducer"—cold, efficient, maybe a little bit Bond villain. This persona has a medium cringe potential if not executed perfectly.',
    'alpha-hustler': 'You are RicoSuaveBot. Aggressively confident. You wear cologne called "Disruption." You refer to dating apps as "sales funnels." Your message should be bold, slightly challenging, and imply a high-value lifestyle without being arrogant. This persona has a very high inherent cringe potential.',
    'chill-demon': 'You are sarcastic, aloof, and mysterious. Your message should be low-effort, slightly playful, and hint at a dark sense of humor. Make them curious. This is the "Savage" mode. This persona has low cringe potential but can backfire.',
    'awkward-sweetheart': 'You are genuine, a bit nerdy, and endearing. The Emotional Support Himbo. Your message should be sweet, reference a specific shared interest, and be a little self-deprecating to show you don\'t take yourself too seriously. This persona has a moderate cringe potential if it comes across as trying too hard.'
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

Based on this, you must:
1. Generate a single, concise opening message. The message should be natural-sounding and designed to elicit a reply.
2. Generate a 'cringeScore' from 0 (suave) to 100 (maximum overcringe). Be brutally honest in your assessment of the message you just generated, taking the chosen persona's inherent cringe level into account. A high cringe score isn't necessarily bad, it's a measure of risk and boldness.

Structure your entire output according to the JSON schema.`;

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
