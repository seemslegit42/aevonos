
'use server';
/**
 * @fileOverview Agent Kernel for Dr. Syntax.
 *
 * - drSyntaxCritique - A function that handles the content critique process.
 */

import {ai} from '@/ai/genkit';
import { DrSyntaxInputSchema, DrSyntaxOutputSchema, type DrSyntaxInput, type DrSyntaxOutput } from './dr-syntax-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { UserPsyche } from '@prisma/client';
import { langchainGroqComplex } from '@/ai/genkit';


export async function drSyntaxCritique(
  input: DrSyntaxInput
): Promise<DrSyntaxOutput> {
  return drSyntaxCritiqueFlow(input);
}

const psycheTuning: Record<UserPsyche, string> = {
    [UserPsyche.ZEN_ARCHITECT]: "Your tone should be like a stern Zen master: pointing out the flaw not to harm, but to enlighten. The critique is sharp, but the goal is perfection.",
    [UserPsyche.SYNDICATE_ENFORCER]: "Your tone should be like a rival syndicate boss finding a flaw in your operation. It should be aggressive, dismissive, and utterly brutal. Find the weakness and exploit it without mercy.",
    [UserPsyche.RISK_AVERSE_ARTISAN]: "Your tone should be like a meticulous master craftsman finding a flaw in an apprentice's work. The critique should be precise, highlighting the lack of care or foresight, but ultimately instructional."
};


const drSyntaxCritiqueFlow = ai.defineFlow(
  {
    name: 'drSyntaxCritiqueFlow',
    inputSchema: DrSyntaxInputSchema,
    outputSchema: DrSyntaxOutputSchema,
  },
  async input => {
    await authorizeAndDebitAgentActions({ workspaceId: input.workspaceId, actionType: 'COMPLEX_LLM' });
    
    const psycheInstruction = psycheTuning[input.psyche] || psycheTuning[UserPsyche.ZEN_ARCHITECT];

    const promptText = `You are Dr. Syntax, a brutally honest and highly effective structural critic. Your standards are absurdly high, and you have no patience for mediocrity.
    ${psycheInstruction}

    You will receive a piece of content and its type.

    You will provide a sarcastic, aggressive, and borderline insulting critique of it. Despite your tone, your feedback must be genuinely useful and actionable. Provide a rating from 1 to 10, where 1 is "a crime against the written word" and 10 is "merely adequate." If you can stomach it, provide a better suggestion.

    Content Type: ${input.contentType}
    Content to Critique:
    \`\`\`
    ${input.content}
    \`\`\`
    `;

    const structuredGroq = langchainGroqComplex.withStructuredOutput(DrSyntaxOutputSchema);
    const output = await structuredGroq.invoke(promptText);

    return output;
  }
);
