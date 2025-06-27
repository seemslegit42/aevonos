'use server';

/**
 * @fileOverview Agent Kernel for Echo, the Context Archivist.
 *
 * - recallSession - A function that handles session summarization.
 * - SessionRecallInput - The input type for the recallSession function.
 * - SessionRecallOutput - The return type for the recallSession function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const SessionRecallInputSchema = z.object({
  sessionActivity: z
    .string()
    .describe('A log of user commands, opened apps, and system events from a previous session.'),
});
export type SessionRecallInput = z.infer<typeof SessionRecallInputSchema>;

const SessionRecallOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise, empathetic summary of the previous session, formatted nicely for display.'
    ),
  keyPoints: z.array(z.string()).describe('A list of key activities or accomplishments from the session.'),
});
export type SessionRecallOutput = z.infer<typeof SessionRecallOutputSchema>;

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
