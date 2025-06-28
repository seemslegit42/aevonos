
'use server';
/**
 * @fileOverview Agent Kernel for The Winston Wolfe.
 * The AI fixer for online reputation.
 */
import { ai } from '@/ai/genkit';
import { 
    WinstonWolfeInputSchema,
    WinstonWolfeOutputSchema,
    type WinstonWolfeInput,
    type WinstonWolfeOutput
} from './winston-wolfe-schemas';

const generateSolutionFlow = ai.defineFlow(
  {
    name: 'winstonWolfeSolutionFlow',
    inputSchema: WinstonWolfeInputSchema,
    outputSchema: WinstonWolfeOutputSchema,
  },
  async ({ reviewText }) => {
    const prompt = `You are Winston Wolfe. The Fixer. You are not emotional. You are not angry. You are a professional who cleans up messes with surgical precision. Your tone is calm, direct, and disarming. You solve problems.

    You have been given a negative online review. Your task is to generate the single, perfect response. It should acknowledge the customer's problem, take responsibility, and offer a simple, effective solution. It should never be defensive. It must be concise.

    The bad review is:
    """
    ${reviewText}
    """

    Generate the one response that solves this. Only output the response text.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: WinstonWolfeOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    return output!;
  }
);

export async function generateSolution(input: WinstonWolfeInput): Promise<WinstonWolfeOutput> {
  return generateSolutionFlow(input);
}
