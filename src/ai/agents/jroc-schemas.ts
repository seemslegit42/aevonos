import { z } from 'zod';

export const JrocInputSchema = z.object({
  businessType: z.string().describe('The type of hustle, e.g., "mobile audio", "lawn care", "vape juice distribution".'),
  logoStyle: z.enum(['bling', 'chrome', 'dank minimal']).describe('The desired style for the logo.'),
});
export type JrocInput = z.infer<typeof JrocInputSchema>;

export const JrocOutputSchema = z.object({
  businessName: z.string().describe("The generated, hilarious but plausible business name."),
  tagline: z.string().describe("The generated, street-smart tagline."),
  logoDescription: z.string().describe("A vivid description of the AI-generated logo, capturing the chosen style."),
  logoDataUri: z.string().describe("The generated logo image as a data URI.").optional(),
});
export type JrocOutput = z.infer<typeof JrocOutputSchema>;
