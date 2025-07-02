
'use server';
/**
 * @fileOverview Agent Kernel for generating Ritual Quests.
 * A vow unacted is a vow broken.
 */
import { ai } from '@/ai/genkit';
import { UserPsyche } from '@prisma/client';
import {
    RitualQuestInputSchema,
    RitualQuestOutputSchema,
    type RitualQuestInput,
    type RitualQuestOutput,
} from './ritual-quests-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const psychePrompts: Record<UserPsyche, string> = {
  [UserPsyche.ZEN_ARCHITECT]: `The user follows the Covenant of Silence. Their path is minimalism, efficiency, and focus. Quests should involve creating clarity and removing noise. For example: "Use Vandelay to create an alibi for 2 hours of deep work," "Critique one of your own prompts with Dr. Syntax for ultimate precision."`,
  [UserPsyche.SYNDICATE_ENFORCER]: `The user follows the Covenant of Motion. Their path is speed, ambition, and results. Quests should be about velocity and decisive action. For example: "Analyze three potential candidates with The Rolodex in under 5 minutes," "Use the Stonks Bot to get advice on a high-volatility asset."`,
  [UserPsyche.RISK_AVERSE_ARTISAN]: `The user follows the Covenant of Worship. Their path is meticulousness, perfection, and safety. Quests should involve validation, checking, and improving quality. For example: "Validate the integrity of three exported dossiers with the Validator," "Use The Winston Wolfe to perfect a response to a difficult customer."`,
};

const generateRitualQuestsFlow = ai.defineFlow(
  {
    name: 'generateRitualQuestsFlow',
    inputSchema: RitualQuestInputSchema,
    outputSchema: RitualQuestOutputSchema,
  },
  async ({ psyche, workspaceId }) => {
    // This is a simple, low-cost generation.
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });

    const prompt = `You are the Chronicler of Vows for ΛΞVON OS. Your purpose is to generate 3-4 personalized "Ritual Quests" for a user based on their chosen psychological path (their Covenant).

    The user's path is: **${psyche}**.
    Your instructions for this path are: **${psycheInstruction}**

    For each quest, you must provide:
    1.  A short, thematic 'title'.
    2.  A one-sentence 'description' of the objective.
    3.  A thematic 'reward' (e.g., "150 Ξ", "50 Ξ and a Shard of Clarity").
    4.  A specific BEEP 'command' that the user would issue to begin or complete the quest. This command should be something the user can realistically type into the command bar.

    Generate a list of 3 quests now. Ensure they are distinct and align perfectly with the user's Covenant philosophy.`;

    const { output } = await ai.generate({
      prompt,
      model: 'googleai/gemini-1.5-flash-latest',
      output: { schema: RitualQuestOutputSchema },
    });

    return output!;
  }
);

export async function generateRitualQuests(input: RitualQuestInput): Promise<RitualQuestOutput> {
  return generateRitualQuestsFlow(input);
}
