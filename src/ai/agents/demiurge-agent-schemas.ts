
'use server';

import { z } from 'zod';
import { FindUsersByVowInputSchema, FindUsersByVowOutputSchema, ManageSyndicateInputSchema, ManageSyndicateOutputSchema, SystemStatusSchema } from '@/ai/tools/demiurge-schemas';

export const DemiurgeActionSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal('get_system_status'),
        params: z.object({}).optional(),
    }),
    z.object({
        action: z.literal('find_users_by_vow'),
        params: FindUsersByVowInputSchema,
    }),
     z.object({
        action: z.literal('manage_syndicate_access'),
        params: ManageSyndicateInputSchema,
    }),
]);
export type DemiurgeAction = z.infer<typeof DemiurgeActionSchema>;

export const DemiurgeAgentInputSchema = DemiurgeActionSchema.extend({
  workspaceId: z.string(),
  userId: z.string(),
});
export type DemiurgeAgentInput = z.infer<typeof DemiurgeAgentInputSchema>;


// The report payload for the 'demiurge' agent
export const DemiurgeAgentReportPayloadSchema = z.discriminatedUnion('action', [
    z.object({ action: z.literal('get_system_status'), report: SystemStatusSchema }),
    z.object({ action: z.literal('find_users_by_vow'), report: FindUsersByVowOutputSchema }),
    z.object({ action: z.literal('manage_syndicate_access'), report: ManageSyndicateOutputSchema }),
]);

// The final output schema of the agent flow
export const DemiurgeAgentOutputSchema = z.object({
    agent: z.literal('demiurge'),
    report: DemiurgeAgentReportPayloadSchema,
});
export type DemiurgeAgentOutput = z.infer<typeof DemiurgeAgentOutputSchema>;
