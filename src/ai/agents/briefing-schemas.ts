import { z } from 'zod';

export const DailyBriefingInputSchema = z.object({
  workspaceId: z.string(),
  userId: z.string(),
  userFirstName: z.string(),
});
export type DailyBriefingInput = z.infer<typeof DailyBriefingInputSchema>;

export const DailyBriefingOutputSchema = z.object({
  greeting: z.string().describe("A personalized greeting for the user, mentioning their name."),
  key_alerts: z.array(z.string()).describe("A list of 2-3 most critical items needing attention, such as security alerts or low credit balance."),
  top_priorities: z.array(z.string()).describe("A list of 2-3 suggested priorities for the day, based on the user's role and recent activity."),
  closing_remark: z.string().describe("A brief, encouraging closing remark."),
});
export type DailyBriefingOutput = z.infer<typeof DailyBriefingOutputSchema>;
