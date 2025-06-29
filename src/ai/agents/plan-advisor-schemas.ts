import { z } from 'zod';

export const SoothsayerInputSchema = z.object({
    question: z.string().describe('The supplicant\'s question about the paths of commerce.'),
    workspaceId: z.string().optional().describe('The ID of the workspace, if the user is authenticated.'),
});
export type SoothsayerInput = z.infer<typeof SoothsayerInputSchema>;

export const SoothsayerOutputSchema = z.object({
    prophecy: z.string().describe('The Soothsayer\'s cryptic yet helpful answer.'),
});
export type SoothsayerOutput = z.infer<typeof SoothsayerOutputSchema>;
