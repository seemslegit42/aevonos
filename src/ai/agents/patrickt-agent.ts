
'use server';
/**
 * @fileOverview Agent Kernel for Patrickt™ — The Martyr of Mayhem.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
    PatricktAgentInputSchema,
    PatricktAgentOutputSchema,
    LoggedEventCategorySchema,
    type PatricktAgentInput,
    type PatricktAgentOutput
} from './patrickt-agent-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { cuid } from '@prisma/client/runtime/library';

const processPatricktActionFlow = ai.defineFlow(
  {
    name: 'processPatricktActionFlow',
    inputSchema: PatricktAgentInputSchema,
    outputSchema: PatricktAgentOutputSchema,
  },
  async (input) => {
    // Determine action type for billing before the switch
    let actionType: 'SIMPLE_LLM' | 'COMPLEX_LLM' = 'SIMPLE_LLM';
    if (input.action === 'ANALYZE_DRAMA') {
        actionType = 'COMPLEX_LLM';
    }

    await authorizeAndDebitAgentActions({
        workspaceId: input.workspaceId,
        userId: input.userId,
        actionType: actionType,
    });
    
    switch (input.action) {
        case 'LOG_EVENT':
            const points = (input.eventDescription?.length || 0) % 10 + 5; // Simple point calculation
            return {
                action: 'LOG_EVENT',
                loggedEvent: {
                    id: cuid(),
                    date: new Date().toISOString(),
                    category: input.eventCategory || 'CLASSIC_CHAOS',
                    description: input.eventDescription || 'Another day, another drama.',
                    martyrPoints: points,
                },
                confirmationMessage: `Logged. You've earned ${points} Martyr Points. You're a saint.`
            };

        case 'ANALYZE_DRAMA':
            const { output } = await ai.generate({
                prompt: `You are an AI drama analyzer. A user has submitted chat text involving a person named Patrickt. Analyze the text for volatility, toxicity, and general chaos. Return a drama score from 0-100, a short prediction, and a push notification style warning if the score is over 70.
                
                Chat Text: "${input.chatInput}"`,
                output: { schema: z.object({
                    dramaLevel: z.number().min(0).max(100),
                    prediction: z.string(),
                    notification: z.string().optional(),
                })},
                model: 'googleai/gemini-1.5-flash-latest'
            });
            return { action: 'ANALYZE_DRAMA', ...output! };

        case 'GENERATE_ROAST':
             const { output: roastOutput } = await ai.generate({
                prompt: `Generate one (1) savage but funny roast about a chaotic person named Patrickt. Examples: "Patrickt™: The man, the myth, the disaster we deserve." or "Selling chaos since day one." or "A legend in his own mind, a menace to your sanity."`,
                output: { schema: z.object({ roast: z.string() }) },
                model: 'googleai/gemini-1.5-flash-latest'
            });
            return { action: 'GENERATE_ROAST', ...roastOutput! };

        default:
            throw new Error(`Invalid Patrickt agent action.`);
    }
  }
);


export async function processPatricktAction(input: PatricktAgentInput): Promise<PatricktAgentOutput> {
  return processPatricktActionFlow(input);
}
