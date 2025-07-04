
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
  shameLevel: z.enum(['Pristine Goddex', 'Snackcident Victim', 'Gremlin Palace Royale', 'Needs a Priest', 'Total Biohazard'])
    .describe("A playful, NSFW-ish 'Dirty Title' that feels like a badge of honor."),
  rating: z.number().min(0).max(100).describe('A cleanliness score from 0 (disaster) to 100 (divine).'),
  roast: z.string().describe('A flirty, teasing one-liner roast—equal parts sass and seduction, aimed at the car and the owner.'),
  recommendedTier: z.enum(['The Quickie', 'Deep Clean Daddy', 'Full Interior Resurrection'])
    .describe('The recommended detail package, framed like a guilty indulgence.'),
  weirdestObject: z.string().describe("Reno's wild guess at the strangest visible object, adding surreal humor.")
});
export type RenoModeAnalysisOutput = z.infer<typeof RenoModeAnalysisOutputSchema>;
