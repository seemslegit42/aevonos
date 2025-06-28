import { z } from 'zod';

export const PlanAdvisorInputSchema = z.object({
    question: z.string().describe('The user\'s question about pricing plans.'),
    workspaceId: z.string().optional().describe('The ID of the workspace, if the user is authenticated.'),
});
export type PlanAdvisorInput = z.infer<typeof PlanAdvisorInputSchema>;

export const PlanAdvisorOutputSchema = z.object({
    answer: z.string().describe('The AI\'s helpful answer to the user\'s question.'),
});
export type PlanAdvisorOutput = z.infer<typeof PlanAdvisorOutputSchema>;
