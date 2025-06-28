import { z } from 'zod';

export const VandelayAlibiInputSchema = z.object({
  topicHint: z.string().optional().describe('An optional hint for the topic of the meeting, e.g., "design review".'),
  addAttendees: z.boolean().optional().describe('Whether to add plausible but fake attendees to the invite.'),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type VandelayAlibiInput = z.infer<typeof VandelayAlibiInputSchema>;

export const VandelayAlibiOutputSchema = z.object({
  title: z.string().describe("The generated, impeccably boring, jargon-filled meeting title."),
  attendees: z.array(z.string()).optional().describe("A list of plausible but fake attendees."),
});
export type VandelayAlibiOutput = z.infer<typeof VandelayAlibiOutputSchema>;
