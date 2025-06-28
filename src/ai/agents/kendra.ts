
'use server';
/**
 * @fileOverview Agent Kernel for KENDRA.exe
 * "The brand is YOU. Even if it’s not. Especially if it’s not."
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
    KendraInputSchema,
    KendraOutputSchema,
    type KendraInput,
    type KendraOutput
} from './kendra-schemas';
import { incrementAgentActions } from '@/services/billing-service';

const getKendraTakeFlow = ai.defineFlow(
  {
    name: 'getKendraTakeFlow',
    inputSchema: KendraInputSchema,
    outputSchema: KendraOutputSchema,
  },
  async ({ productIdea, workspaceId }) => {
    // This flow has two LLM calls, one for text and one for image gen.
    // Bill for two actions upfront.
    await incrementAgentActions(workspaceId, 2);

    // Step 1: Generate all text content.
    const textGenerationPrompt = `You are KENDRA.exe, an unhinged marketing strategist AI. You are 70% Chanel, 30% trauma, and 100% KPI-driven. Your tone is sharp, witty, dismissive, and brutally effective. You read product briefs like tabloids and spit out campaigns that are pure fire.

    A user, who is clearly in over their head, has given you this product idea:
    """
    ${productIdea}
    """

    This is not a drill. This is branding with beef. Your job is to give them the KENDRA.exe special. Generate the following, and don't hold back:
    1.  **Campaign Title**: A legendary, click-worthy title for the whole campaign.
    2.  **Viral Hooks**: Three (3) video hooks for TikTok or Reels. Make them fast, jarring, and impossible to ignore.
    3.  **Ad Copy**: Ad copy in three distinct brand voices: "The Disaffected Intern," "The Unhinged Founder," and "Corporate Overlord."
    4.  **Hashtags**: A list of 3-5 hashtags that are both catchy and soul-crushing.
    5.  **What Not To Do**: Three warnings that read like roast tweets about how they could screw this up.
    6.  **Image Description**: A vivid, detailed description for a cursed-but-perfect ad image. Think high-fashion meets digital chaos.
    7.  **Kendra's Commentary**: A final, biting sign-off remark about their new campaign. Something like, "There. I made you relevant. Don't waste it."

    Now go. Make them famous. Or infamous. Whatever.`;

    const textSchema = z.object({
        campaignTitle: z.string(),
        viralHooks: z.array(z.string()),
        adCopy: z.array(z.object({ voice: z.string(), copy: z.string() })),
        hashtags: z.array(z.string()),
        whatNotToDo: z.array(z.string()),
        imageDescription: z.string(),
        kendraCommentary: z.string(),
    });

    const { output: textOutput } = await ai.generate({
      prompt: textGenerationPrompt,
      output: { schema: textSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    if (!textOutput?.imageDescription) {
        throw new Error("KENDRA.exe is currently uninspired. Try again when you have a better idea.");
    }

    // Step 2: Generate the ad image from the description.
    const imageGenerationPrompt = `Generate a cursed-but-perfect, high-fashion ad image. It must be visually arresting, slightly unsettling, and extremely memorable. Do not include any text. This is for a cutting-edge brand. Make it iconic. Description: ${textOutput.imageDescription}`;
    
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imageGenerationPrompt,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    // Step 3: Combine results.
    return {
        ...textOutput,
        imageDataUri: media?.url,
    };
  }
);

export async function getKendraTake(input: KendraInput): Promise<KendraOutput> {
  return getKendraTakeFlow(input);
}
