
import { z } from 'zod';

export const DecoyInputSchema = z.object({
  targetDescription: z.string().describe('A brief description of the target, including name, interests, and context.'),
  persona: z.enum(['sapiosexual', 'alpha-hustler', 'chill-demon', 'awkward-sweetheart'])
    .optional()
    .describe('The persona the decoy agent should adopt for the message. If not provided, one will be chosen.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type DecoyInput = z.infer<typeof DecoyInputSchema>;

export const DecoyOutputSchema = z.object({
  decoyMessage: z.string().describe('The generated decoy message designed to elicit a response.'),
  persona: z.enum(['sapiosexual', 'alpha-hustler', 'chill-demon', 'awkward-sweetheart'])
    .describe('The persona the decoy agent adopted for the message.'),
});
export type DecoyOutput = z.infer<typeof DecoyOutputSchema>;
