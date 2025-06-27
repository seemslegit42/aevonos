import { z } from 'zod';

export const WinstonWolfeInputSchema = z.object({
  reviewText: z.string().describe('The negative review text that needs a solution.'),
});
export type WinstonWolfeInput = z.infer<typeof WinstonWolfeInputSchema>;

export const WinstonWolfeOutputSchema = z.object({
  suggestedResponse: z.string().describe("The generated perfect, concise, professional, and disarming response to the negative review."),
});
export type WinstonWolfeOutput = z.infer<typeof WinstonWolfeOutputSchema>;
