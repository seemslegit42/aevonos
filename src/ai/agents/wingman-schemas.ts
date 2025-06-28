import { z } from 'zod';

export const WingmanInputSchema = z.object({
  situationContext: z.string().describe("A description of the situation: who you're talking to, your relationship, and what you want to achieve."),
  messageMode: z.enum([
      'Cool & Collected', 
      'Charming AF', 
      'Roast w/ Precision', 
      'Protective Custody', 
      'Make Me Seem Smarter', 
      'Help Me Say No'
    ]).describe("The desired tone and style of the message."),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type WingmanInput = z.infer<typeof WingmanInputSchema>;

export const WingmanOutputSchema = z.object({
  suggestedMessage: z.string().describe("The single best message crafted by Wingman for the situation."),
  cringeScore: z.number().min(0).max(100).describe('A score from 0 (suave) to 100 (cringe-worthy) based on the Cringe Detection Engine™.'),
  vibe: z.enum(['Smooth', 'Slightly Risky', 'You Will Regret This']).describe('An assessment of the social risk of sending this message.'),
  analysis: z.string().describe('A brief, brutally honest analysis explaining the score and vibe.'),
  regretShieldTriggered: z.boolean().describe("True if the Regret Shield™ recommends delaying the send due to high emotional charge or risk."),
  regretShieldReason: z.string().describe("The reason why the Regret Shield™ was triggered. Explains the risks of sending immediately."),
});
export type WingmanOutput = z.infer<typeof WingmanOutputSchema>;
