
import { z } from 'zod';
import { UserPsyche } from '@prisma/client';

export const InvocationInputSchema = z.object({
  whatMustEnd: z.string().describe("The user's declared 'sacrifice' during the Rite of Invocation."),
  goal: z.string().describe("The user's declared 'vow' or goal during the Rite of Invocation."),
  psyche: z.nativeEnum(UserPsyche),
  agentAlias: z.string(),
});
export type InvocationInput = z.infer<typeof InvocationInputSchema>;

export const InvocationOutputSchema = z.object({
  corePainIndex: z.number().min(0).max(100).describe("A shadow metric from 0-100 indicating the user's core pain, where 100 is extreme pain/burnout."),
  foundingBenediction: z.string().describe("A personalized, poetic benediction based on the user's vow, sacrifice, and chosen psyche."),
  firstWhisper: z.string().describe("The suggested first command for BEEP to give the new user, phrased as a question."),
  firstCommand: z.string().describe("The specific BEEP command to execute if the user accepts the whisper."),
});
export type InvocationOutput = z.infer<typeof InvocationOutputSchema>;
