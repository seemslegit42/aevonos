import { z } from 'zod';

export const KendraInputSchema = z.object({
  productIdea: z.string().describe('The user\'s raw, unfiltered product idea or startup concept.'),
});
export type KendraInput = z.infer<typeof KendraInputSchema>;

export const KendraOutputSchema = z.object({
  campaignTitle: z.string().describe("The main, unhinged title for the entire campaign."),
  viralHooks: z.array(z.string()).describe('A list of 3-5 brutally effective, TikTok-ready viral video hooks.'),
  adCopy: z.array(z.object({
    voice: z.string().describe('The brand voice persona, e.g., "The Disaffected Intern", "The Unhinged Founder".'),
    copy: z.string().describe('The ad copy written in that voice.'),
  })).describe('Ad copy written in 3 distinct, problematic-but-effective brand voices.'),
  hashtags: z.array(z.string()).describe('A list of hashtags that will make you trend and question your life choices.'),
  whatNotToDo: z.array(z.string()).describe('A list of "What Not To Do" warnings that read like roast tweets.'),
  imageDescription: z.string().describe('A detailed, vivid description of a cursed-but-perfect AI ad image.'),
  imageDataUri: z.string().optional().describe('The generated cursed-but-perfect ad image as a data URI.'),
  kendraCommentary: z.string().describe("Kendra's final, biting sign-off remark about the campaign."),
});
export type KendraOutput = z.infer<typeof KendraOutputSchema>;
