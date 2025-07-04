
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
  chaosLevel: z.enum(['Practically Pristine', 'Snackpocalypse Now', 'Gremlin Palace Royale', 'Needs an Intervention', 'Total Biohazard'])
    .describe("A playful, NSFW-ish 'Mess Title' that feels iconic."),
  rating: z.number().min(0).max(100).describe('Clutter score (0-100) with dramatic flair.'),
  roast: z.string().describe('Teasing, flirty one-liner roast—just enough sass to make you grin, not cry.'),
  recommendedTier: z.enum(['The Quickie', 'Deep Clean Daddy', 'Full Interior Resurrection'])
    .describe('A lovingly exaggerated cleanup tier suggestion, like a guilty pleasure indulgence.'),
  weirdestObject: z.string().describe("Reno's wild guess at the oddest visible object—bonus points for absurdity.")
});
export type RenoModeAnalysisOutput = z.infer<typeof RenoModeAnalysisOutputSchema>;
