
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
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { getCachedAlibi, setCachedAlibi } from './vandelay-cache';

const generateAlibiFlow = ai.defineFlow(
  {
    name: 'vandelayAlibiFlow',
    inputSchema: VandelayAlibiInputSchema,
    outputSchema: VandelayAlibiOutputSchema,
  },
  async ({ topicHint, addAttendees, workspaceId }) => {
    // --- CACHING LOGIC ---
    const cacheKey = `vandelay-alibi:${topicHint?.toLowerCase().trim() || 'generic'}-${!!addAttendees}`;
    const cachedAlibi = await getCachedAlibi(cacheKey);
    if (cachedAlibi) {
      console.log(`[Vandelay Agent] Cache hit for key: ${cacheKey}. Returning pre-computed response.`);
      // IMPORTANT: Even with a cache hit, we must bill for the action.
      // The value is in the result, not just the computation.
      await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });
      return cachedAlibi;
    }
    console.log(`[Vandelay Agent] Cache miss for key: ${cacheKey}. Calling LLM.`);
    // --- END CACHING_LOGIC ---

    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });

    const prompt = `You are an AI assistant for Vandelay Industries, specializing in "importing and exporting" creative alibis. Your sole purpose is to generate one impeccably boring, jargon-filled, and entirely plausible fake calendar invite.

    You must use a mix of corporate buzzwords and vague concepts. The goal is to create a title that is so profoundly dull that no one would ever question it or want to join.
    
    Examples of good titles:
    - "Q3 Synergy Debrief (Pre-Alignment Sync)"
    - "Touchpoint on Strategic Verticals"
    - "Blue-Sky Ideation Session"

    The user might provide a topic hint. If so, weave it into the jargon. For example, if the hint is "design review", a good title would be "Async Design Review & Heuristics Alignment".
    
    User's Topic Hint: ${topicHint || 'None provided, generate a generic one.'}
    ${addAttendees ? `
    Additionally, you must generate a list of 2-3 plausible but fake attendees. Make them sound like external stakeholders or consultants to increase legitimacy.
    Examples of good attendees:
    - "jen@synergyconsulting.io"
    - "Dr. Alistair Finch (Compliance)"
    - "Mark (Third-Party Vendor)"
    ` : `
    Do not generate attendees unless specifically instructed.`}

    Structure your entire output according to the JSON schema.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: VandelayAlibiOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });
    
    if (output) {
        await setCachedAlibi(cacheKey, output);
    }

    return output!;
  }
);

export async function createVandelayAlibi(input: VandelayAlibiInput): Promise<VandelayAlibiOutput> {
  return generateAlibiFlow(input);
}
