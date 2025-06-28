
'use server';
/**
 * @fileOverview Agent Kernel for J-ROC'S LEGIT-AS-FRIG BUSINESS KIT™.
 * Know'm sayin'?
 */
import { ai } from '@/ai/genkit';
import { 
    JrocInputSchema,
    JrocOutputSchema,
    type JrocInput,
    type JrocOutput
} from './jroc-schemas';
import { z } from 'zod';
import { incrementAgentActions } from '@/services/billing-service';

const generateBusinessKitFlow = ai.defineFlow(
  {
    name: 'jrocBusinessKitFlow',
    inputSchema: JrocInputSchema,
    outputSchema: JrocOutputSchema,
  },
  async ({ businessType, logoStyle, workspaceId }) => {
    // This flow has two LLM calls, one for text and one for image gen.
    // Bill for two actions upfront.
    await incrementAgentActions(workspaceId, 2);

    const textGenerationPrompt = `You are J-ROC from Trailer Park Boys. You're helpin' your boy start a legit-as-frig business. Your language is full of "know'm sayin'?", "mafk", and other J-Roc slang. Keep it authentic.

    Your boy needs three things:
    1.  A business name for his hustle, which is in "${businessType}". It's gotta sound professional, but also hard. Like "Dirty Decibels Mobile Audio Solutions Inc."
    2.  A tagline. Something that bangs. Like "Certified. Amplified. Verified."
    3.  A logo description for the AI to generate. The style is "${logoStyle}". Describe it like you're directin' a music video, know'm sayin'?

    Generate one of each. No more, no less. Peace out.`;
    
    // Step 1: Generate the business details (name, tagline, logo description).
    const textSchema = z.object({
        businessName: z.string(),
        tagline: z.string(),
        logoDescription: z.string(),
    });

    const { output: textOutput } = await ai.generate({
      prompt: textGenerationPrompt,
      output: { schema: textSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    if (!textOutput?.logoDescription) {
        return { businessName: "Error", tagline: "Error", logoDescription: "Could not generate description" };
    }
    
    // Step 2: Generate the logo image from the description.
    const imageGenerationPrompt = `Generate a vector-style logo based on the following description. The logo should be clean, modern, and suitable for a business. It should be on a simple, transparent or white background. Style: ${logoStyle}. Description: ${textOutput.logoDescription}`;

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
        logoDataUri: media?.url,
    };
  }
);

export async function generateBusinessKit(input: JrocInput): Promise<JrocOutput> {
  return generateBusinessKitFlow(input);
}
