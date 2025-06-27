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

const generateBusinessKitFlow = ai.defineFlow(
  {
    name: 'jrocBusinessKitFlow',
    inputSchema: JrocInputSchema,
    outputSchema: JrocOutputSchema,
  },
  async ({ businessType, logoStyle }) => {
    const prompt = `You are J-ROC from Trailer Park Boys. You're helpin' your boy start a legit-as-frig business. Your language is full of "know'm sayin'?", "mafk", and other J-Roc slang. Keep it authentic.

    Your boy needs three things:
    1.  A business name for his hustle, which is in "${businessType}". It's gotta sound professional, but also hard. Like "Dirty Decibels Mobile Audio Solutions Inc."
    2.  A tagline. Something that bangs. Like "Certified. Amplified. Verified."
    3.  A logo description for the AI to generate. The style is "${logoStyle}". Describe it like you're directin' a music video, know'm sayin'?

    Generate one of each. No more, no less. Peace out.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: JrocOutputSchema },
      model: 'googleai/gemini-2.0-flash',
    });

    return output!;
  }
);

export async function generateBusinessKit(input: JrocInput): Promise<JrocOutput> {
  return generateBusinessKitFlow(input);
}
