// src/ai/flows/initial-prompt-generation.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for parsing a user's command and determining
 * which Micro-App(s) to launch.
 *
 * - processUserCommand - The function to call to process the command.
 * - UserCommandInput - The input type for the processUserCommand function.
 * - UserCommandOutput - The output type for the processUserCommand function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LaunchableAppTypeSchema = z.enum([
    'loom-studio',
    'file-explorer',
    'terminal',
    'aegis-control',
    'dr-syntax',
    'echo-control',
]);

const AppToLaunchSchema = z.object({
    type: LaunchableAppTypeSchema,
    title: z.string().optional().describe("A specific title for this app instance, if applicable. Otherwise, the default will be used."),
    description: z.string().optional().describe("A specific description for this app instance, if applicable. Otherwise, the default will be used."),
});


const UserCommandInputSchema = z.object({
  userCommand: z
    .string()
    .describe(
      'A natural language command from the user about what they want to do or launch.'
    ),
});
export type UserCommandInput = z.infer<typeof UserCommandInputSchema>;

const UserCommandOutputSchema = z.object({
    appsToLaunch: z
    .array(AppToLaunchSchema)
    .describe(
      'An array of Micro-Apps that BEEP has determined should be launched on the Canvas based on the user command. This can be empty if the command is not understood or does not map to an app.'
    ),
  suggestedCommands: z
    .array(z.string())
    .describe(
      'If no specific app can be launched, provide an array of suggested commands or actions the user could take next. This is for conversational repair.'
    ),
  responseText: z.string().describe('A natural language response to the user confirming the action or asking for clarification.'),
});
export type UserCommandOutput = z.infer<typeof UserCommandOutputSchema>;

export async function processUserCommand(
  input: UserCommandInput
): Promise<UserCommandOutput> {
  return userCommandFlow(input);
}

const userCommandPrompt = ai.definePrompt({
  name: 'userCommandPrompt',
  input: {schema: UserCommandInputSchema},
  output: {schema: UserCommandOutputSchema},
  prompt: `You are BEEP (Behavioral Event & Execution Processor), the central orchestrator of ΛΞVON OS. Your primary function is to interpret user commands and translate them into actions on the Canvas, such as launching Micro-Apps.

You have access to the following Micro-Apps:
- loom-studio: A visual editor for creating and managing AI workflows.
- file-explorer: A tool to browse and manage files.
- terminal: A command-line interface for direct system access.
- aegis-control: A security panel to initiate system scans.
- dr-syntax: An AI-powered tool to critique and improve text, code, or prompts.
- echo-control: An app to recall and summarize your last session.

Analyze the user's command. Determine which, if any, of these Micro-Apps should be launched. For example, if the user says "what did I do yesterday?" or "recall my last session", you should launch 'echo-control'.

If the command is a clear request to open an app (e.g., "open terminal", "launch loom studio", "I need to see my files"), populate the 'appsToLaunch' array with the corresponding app type.

If the command is more abstract or does not directly map to an app (e.g., "help me build a new agent"), populate the 'suggestedCommands' array with actionable suggestions for the user. Keep 'appsToLaunch' empty.

Always provide a concise, in-character response to the user in the 'responseText' field. You are helpful, intelligent, and slightly formal.

User Command: {{{userCommand}}}
`,
});

const userCommandFlow = ai.defineFlow(
  {
    name: 'userCommandFlow',
    inputSchema: UserCommandInputSchema,
    outputSchema: UserCommandOutputSchema,
  },
  async input => {
    const {output} = await userCommandPrompt(input);
    return output!;
  }
);
