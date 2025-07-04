
'use server';

import { z } from 'zod';
import { AgentReportSchema } from './beep-schemas';
import { CreateContactInputSchema, UpdateContactInputSchema, DeleteContactInputSchema } from '@/ai/tools/crm-schemas';

export const CrmActionSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal('create'),
        params: CreateContactInputSchema.describe("Parameters for creating a new contact."),
    }),
    z.object({
        action: z.literal('update'),
        params: UpdateContactInputSchema.describe("Parameters for updating an existing contact."),
    }),
     z.object({
        action: z.literal('list'),
        params: z.object({}).optional().describe("No parameters are needed for a list action."),
    }),
     z.object({
        action: z.literal('delete'),
        params: DeleteContactInputSchema.describe("Parameters for deleting a contact."),
    }),
]);
export type CrmAction = z.infer<typeof CrmActionSchema>;

export const CrmAgentInputSchema = CrmActionSchema.extend({
  workspaceId: z.string(),
  userId: z.string(),
});
export type CrmAgentInput = z.infer<typeof CrmAgentInputSchema>;


// The output will be a subset of the main AgentReportSchema
export const CrmAgentOutputSchema = z.object({
    agent: z.literal('crm'),
    report: AgentReportSchema.shape.report.extract<{agent: 'crm'}>().shape.report,
});
export type CrmAgentOutput = z.infer<typeof CrmAgentOutputSchema>;
