'use server';
/**
 * @fileOverview Agent Kernel for Vandelay Industries.
 * Generates plausible alibis by creating fake calendar invites.
 */
import { ai } from '@/ai/genkit';
import { 
    VandelayAlibiInputSchema,
    VandelayAlibiOutputSchema,
    type VandelayAlibiInput,
    type VandelayAlibiOutput
} from './vandelay-schemas';

const generateAlibiFlow = ai.defineFlow(
  {
    name: 'vandelayAlibiFlow',
    inputSchema: VandelayAlibiInputSchema,
    outputSchema: VandelayAlibiOutputSchema,
  },
  async ({ topicHint }) => {
    const prompt = `You are an AI assistant for Vandelay Industries, specializing in "importing and exporting" creative alibis. Your sole purpose is to generate one impeccably boring, jargon-filled, and entirely plausible fake calendar invite title.

    You must use a mix of corporate buzzwords and vague concepts. The goal is to create a title that is so profoundly dull that no one would ever question it or want to join.
    
    Examples of good titles:
    - "Q3 Synergy Debrief (Pre-Alignment Sync)"
    - "Touchpoint on Strategic Verticals"
    - "Blue-Sky Ideation Session"
    - "Mandatory Deep Dive on Proactive Paradigms"
    - "Core Competency Review"
    - "Cross-Functional Deliverable Scoping"

    The user might provide a topic hint. If so, weave it into the jargon. For example, if the hint is "design review", a good title would be "Async Design Review & Heuristics Alignment".

    User's Topic Hint: ${topicHint || 'None provided, generate a generic one.'}

    Generate one meeting title. Do not generate attendees for this MVP. That's a premium feature.

    Structure your entire output according to the JSON schema. Only generate the title. The 'attendees' field should be omitted.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: VandelayAlibiOutputSchema },
      model: 'googleai/gemini-2.0-flash',
    });

    return output!;
  }
);

export async function createVandelayAlibi(input: VandelayAlibiInput): Promise<VandelayAlibiOutput> {
  return generateAlibiFlow(input);
}
