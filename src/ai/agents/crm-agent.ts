
'use server';
/**
 * @fileOverview The CRM Daemon, a specialist agent for contact management.
 */
import { ai } from '@/ai/genkit';
import { CrmAgentInputSchema, CrmAgentOutputSchema, type CrmAgentInput, type CrmAgentOutput } from './crm-agent-schemas';
import { createContactInDb, listContactsFromDb, updateContactInDb, deleteContactInDb } from '@/ai/tools/crm-tools';

const consultCrmAgentFlow = ai.defineFlow({
    name: 'consultCrmAgentFlow',
    inputSchema: CrmAgentInputSchema,
    outputSchema: CrmAgentOutputSchema,
}, async (input) => {
    const { action, params, workspaceId, userId } = input;
    
    let report;
    switch (action) {
        case 'create':
            report = { action: 'create' as const, report: await createContactInDb(params, workspaceId, userId) };
            break;
        case 'update':
            report = { action: 'update' as const, report: await updateContactInDb(params, workspaceId, userId) };
            break;
        case 'delete':
            report = { action: 'delete' as const, report: await deleteContactInDb(params, workspaceId, userId) };
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
