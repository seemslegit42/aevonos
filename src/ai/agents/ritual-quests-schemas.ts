
import { z } from 'zod';
import { UserPsyche } from '@prisma/client';

export const RitualQuestInputSchema = z.object({
  psyche: z.nativeEnum(UserPsyche),
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type RitualQuestInput = z.infer<typeof RitualQuestInputSchema>;

const QuestSchema = z.object({
  title: z.string().describe('The name of the quest.'),
  description: z.string().describe('A brief, thematic description of the quest\'s objective.'),
  reward: z.string().describe('The reward for completing the quest, as a string (e.g., "150 Ξ").'),
  command: z.string().describe('The BEEP command to initiate or complete the quest.'),
});
export type Quest = z.infer<typeof QuestSchema>;

export const RitualQuestOutputSchema = z.object({
  quests: z.array(QuestSchema),
});
export type RitualQuestOutput = z.infer<typeof RitualQuestOutputSchema>;
