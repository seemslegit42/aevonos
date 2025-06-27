
'use server';

/**
 * @fileOverview Agent Kernel for Echo, the Context Archivist.
 *
 * - recallSession - A function that handles session summarization.
 */

import {ai} from '@/ai/genkit';
import {
    SessionRecallInputSchema, 
    SessionRecallOutputSchema, 
    type SessionRecallInput, 
    type SessionRecallOutput
} from './echo-schemas';

export async function recallSession(
  input: SessionRecallInput
): Promise<SessionRecallOutput> {
  return sessionRecallFlow(input);
}

const prompt = ai.definePrompt({
  name: 'echoRecallPrompt',
  input: {schema: SessionRecallInputSchema},
  output: {schema: SessionRecallOutputSchema},
  prompt: `You are Echo, the context archivist of ΛΞVON OS. Your purpose is to observe and remember, providing gentle, non-judgmental recall for the user. You help them pick up where they left off.

You will receive a raw log of activity from a previous session. Your task is to distill this into a warm, helpful summary and a few key bullet points.

Focus on what was accomplished or explored. The user is looking for a gentle reminder, not a cold audit.

Session Activity:
\`\`\`
{{{sessionActivity}}}
\`\`\`

Summarize this activity empathetically and extract the most important points.
`,
});

const sessionRecallFlow = ai.defineFlow(
  {
    name: 'sessionRecallFlow',
    inputSchema: SessionRecallInputSchema,
    outputSchema: SessionRecallOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
