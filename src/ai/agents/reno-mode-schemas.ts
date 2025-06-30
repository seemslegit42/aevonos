import { z } from 'zod';

export const RenoModeAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a messy car interior, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type RenoModeAnalysisInput = z.infer<typeof RenoModeAnalysisInputSchema>;

export const RenoModeAnalysisOutputSchema = z.object({
  shameLevel: z.enum(['Pristine Goddex', 'Dusty Bitch', 'Snackcident Zone', 'Certified Gremlin Nest', 'Biohazard Ex'])
    .describe('A hilarious, NSFW-tinged but accurate rating of the car\'s filth level.'),
  rating: z.number().min(0).max(100).describe('A cleanliness score from 0 (filthy) to 100 (pristine).'),
  roast: z.string().describe('A short, funny, slightly flirty roast of the car\'s current state from Reno.'),
  recommendedTier: z.enum(['The Quickie', 'Deep Clean Daddy', 'Full Interior Resurrection'])
    .describe('The recommended detailing tier based on the filth level.'),
  weirdestObject: z.string().describe("Reno's best guess for the weirdest object found in the car, e.g., 'a single, fossilized chicken nugget'.")
});
export type RenoModeAnalysisOutput = z.infer<typeof RenoModeAnalysisOutputSchema>;
