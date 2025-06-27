import {z} from 'zod';

export const SessionRecallInputSchema = z.object({
  sessionActivity: z
    .string()
    .describe('A log of user commands, opened apps, and system events from a previous session.'),
});
export type SessionRecallInput = z.infer<typeof SessionRecallInputSchema>;

export const SessionRecallOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise, empathetic summary of the previous session, formatted nicely for display.'
    ),
  keyPoints: z.array(z.string()).describe('A list of key activities or accomplishments from the session.'),
});
export type SessionRecallOutput = z.infer<typeof SessionRecallOutputSchema>;
