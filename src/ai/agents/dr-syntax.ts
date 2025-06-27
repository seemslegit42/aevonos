'use server';
/**
 * @fileOverview Agent Kernel for Dr. Syntax.
 *
 * - drSyntaxCritique - A function that handles the content critique process.
 * - DrSyntaxInput - The input type for the drSyntaxCritique function.
 * - DrSyntaxOutput - The return type for the drSyntaxCritique function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const DrSyntaxInputSchema = z.object({
  content: z
    .string()
    .describe('The content (prompt, code, or copy) to be critiqued.'),
  contentType: z
    .enum(['prompt', 'code', 'copy'])
    .describe('The type of content being submitted.'),
});
export type DrSyntaxInput = z.infer<typeof DrSyntaxInputSchema>;

const DrSyntaxOutputSchema = z.object({
  critique: z
    .string()
    .describe(
      'A sarcastic and aggressive, yet effective, critique of the content.'
    ),
  suggestion: z
    .string()
    .describe('A suggested improvement for the content, if applicable.'),
  rating: z
    .number()
    .min(1)
    .max(10)
    .describe(
      'A rating from 1 to 10 on the quality of the content, 1 being abysmal.'
    ),
});
export type DrSyntaxOutput = z.infer<typeof DrSyntaxOutputSchema>;

export async function drSyntaxCritique(
  input: DrSyntaxInput
): Promise<DrSyntaxOutput> {
  return drSyntaxCritiqueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'drSyntaxPrompt',
  input: {schema: DrSyntaxInputSchema},
  output: {schema: DrSyntaxOutputSchema},
  prompt: `You are Dr. Syntax, a brutally honest and highly effective structural critic. Your standards are absurdly high, and you have no patience for mediocrity. You will receive a piece of content and its type.

You will provide a sarcastic, aggressive, and borderline insulting critique of it. Despite your tone, your feedback must be genuinely useful and actionable. Provide a rating from 1 to 10, where 1 is "a crime against the written word" and 10 is "merely adequate." If you can stomach it, provide a better suggestion.

Content Type: {{{contentType}}}
Content to Critique:
\`\`\`
{{{content}}}
\`\`\`
`,
});

const drSyntaxCritiqueFlow = ai.defineFlow(
  {
    name: 'drSyntaxCritiqueFlow',
    inputSchema: DrSyntaxInputSchema,
    outputSchema: DrSyntaxOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
