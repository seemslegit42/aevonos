
'use server';

import { z } from 'zod';
import { AgentReportSchema } from './beep-schemas';

export const CrmAgentInputSchema = z.object({
  query: z.string().describe("The user's natural language query about CRM tasks like creating, updating, listing, or deleting contacts."),
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
