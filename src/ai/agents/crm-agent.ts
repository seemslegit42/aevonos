
'use server';
/**
 * @fileOverview The CRM Daemon, a specialist agent for contact management.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { CrmAgentInputSchema, CrmAgentOutputSchema, type CrmAgentInput, type CrmAgentOutput } from './crm-agent-schemas';
import { createContactInDb, listContactsFromDb, updateContactInDb, deleteContactInDb } from '@/ai/tools/crm-tools';
import { langchainGroqComplex } from '../genkit';
import { CreateContactInputSchema, UpdateContactInputSchema, DeleteContactInputSchema } from '../tools/crm-schemas';

const CrmActionSchema = z.discriminatedUnion("action", [
    z.object({
        action: z.literal('create'),
        params: CreateContactInputSchema,
    }),
    z.object({
        action: z.literal('update'),
        params: UpdateContactInputSchema,
    }),
     z.object({
        action: z.literal('list'),
        params: z.object({}).optional(),
    }),
     z.object({
        action: z.literal('delete'),
        params: DeleteContactInputSchema,
    }),
]);

const consultCrmAgentFlow = ai.defineFlow({
    name: 'consultCrmAgentFlow',
    inputSchema: CrmAgentInputSchema,
    outputSchema: CrmAgentOutputSchema,
}, async ({ query, workspaceId, userId }) => {
    
    const structuredTriageModel = langchainGroqComplex.withStructuredOutput(CrmActionSchema);
    const triageResult = await structuredTriageModel.invoke(
        `Parse the user's CRM-related command and determine the correct action and parameters. The user's query is: "${query}"`
    );
    
    let report;
    switch (triageResult.action) {
        case 'create':
            report = { action: 'create' as const, report: await createContactInDb(triageResult.params, workspaceId, userId) };
            break;
        case 'update':
            report = { action: 'update' as const, report: await updateContactInDb(triageResult.params, workspaceId, userId) };
            break;
        case 'delete':
            report = { action: 'delete' as const, report: await deleteContactInDb(triageResult.params, workspaceId, userId) };
            break;
        case 'list':
        default:
            report = { action: 'list' as const, report: await listContactsFromDb(workspaceId, userId) };
            break;
    }
    
    return { agent: 'crm', report };
});

export async function consultCrmAgent(input: CrmAgentInput): Promise<CrmAgentOutput> {
  return consultCrmAgentFlow(input);
}
