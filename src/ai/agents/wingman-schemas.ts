import { z } from 'zod';

export const WingmanInputSchema = z.object({
  targetDescription: z.string().describe('A brief description of the dating profile, including name, interests, and any bio text.'),
  persona: z.enum(['sapiosexual', 'alpha-hustler', 'chill-demon', 'awkward-sweetheart'])
    .describe('The persona the wingman agent should adopt for the message.'),
});
export type WingmanInput = z.infer<typeof WingmanInputSchema>;

export const WingmanOutputSchema = z.object({
  openingMessage: z.string().describe('The generated opening message designed to start a conversation.'),
  cringeScore: z.number().min(0).max(100).describe('A score from 0 (suave) to 100 (cringe-worthy) on the generated message. Be brutally honest.'),
});
export type WingmanOutput = z.infer<typeof WingmanOutputSchema>;
