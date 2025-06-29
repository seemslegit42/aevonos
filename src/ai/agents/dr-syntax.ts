
'use server';
/**
 * @fileOverview Agent Kernel for Dr. Syntax.
 *
 * - drSyntaxCritique - A function that handles the content critique process.
 */

import {ai} from '@/ai/genkit';
import { DrSyntaxInputSchema, DrSyntaxOutputSchema, type DrSyntaxInput, type DrSyntaxOutput } from './dr-syntax-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';


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
    await authorizeAndDebitAgentActions(input.workspaceId);
    const {output} = await prompt(input);
    return output!;
  }
);
