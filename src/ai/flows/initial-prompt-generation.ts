// src/ai/flows/initial-prompt-generation.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating initial prompts or micro-apps
 * suggestions based on a high-level user description of their desired outcome.
 *
 * - generateInitialPrompts - The function to call to generate the suggestions.
 * - InitialPromptInput - The input type for the generateInitialPrompts function.
 * - InitialPromptOutput - The output type for the generateInitialPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialPromptInputSchema = z.object({
  userDescription: z
    .string()
    .describe(
      'A high-level description from the user about what they want to achieve.'
    ),
});
export type InitialPromptInput = z.infer<typeof InitialPromptInputSchema>;

const InitialPromptOutputSchema = z.object({
  suggestedCommands: z
    .array(z.string())
    .describe(
      'An array of suggested commands or micro-apps to help the user get started.'
    ),
});
export type InitialPromptOutput = z.infer<typeof InitialPromptOutputSchema>;

export async function generateInitialPrompts(
  input: InitialPromptInput
): Promise<InitialPromptOutput> {
  return initialPromptFlow(input);
}

const initialPrompt = ai.definePrompt({
  name: 'initialPrompt',
  input: {schema: InitialPromptInputSchema},
  output: {schema: InitialPromptOutputSchema},
  prompt: `You are an intelligent assistant designed to suggest initial commands or micro-apps to users based on their high-level descriptions.

  Please provide a list of suggested commands or micro-apps that would help the user achieve their goal.
  User Description: {{{userDescription}}}
  `, // Ensure the prompt is well-formatted and clear
});

const initialPromptFlow = ai.defineFlow(
  {
    name: 'initialPromptFlow',
    inputSchema: InitialPromptInputSchema,
    outputSchema: InitialPromptOutputSchema,
  },
  async input => {
    const {output} = await initialPrompt(input);
    return output!;
  }
);
