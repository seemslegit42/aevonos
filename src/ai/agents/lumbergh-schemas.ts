import { z } from 'zod';

export const LumberghAnalysisInputSchema = z.object({
  inviteText: z.string().describe('The full text or description of the meeting invite, including title, attendees, and agenda (or lack thereof).'),
});
export type LumberghAnalysisInput = z.infer<typeof LumberghAnalysisInputSchema>;

export const LumberghAnalysisOutputSchema = z.object({
  isFlagged: z.boolean().describe('Whether the meeting is flagged as pointless or not.'),
  flagReason: z.string().describe("The reason for flagging the meeting, delivered in Lumbergh's passive-aggressive tone."),
  declineMemos: z.array(z.string()).describe("A list of 2-3 perfectly passive-aggressive decline memos."),
});
export type LumberghAnalysisOutput = z.infer<typeof LumberghAnalysisOutputSchema>;
