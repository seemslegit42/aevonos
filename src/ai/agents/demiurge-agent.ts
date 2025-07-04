
'use server';
/**
 * @fileOverview The Demiurge, a specialist agent for workspace architecture tasks.
 */
import { ai } from '@/ai/genkit';
import { DemiurgeAgentInputSchema, DemiurgeAgentOutputSchema, type DemiurgeAgentInput, type DemiurgeAgentOutput, DemiurgeAgentReportPayloadSchema } from './demiurge-agent-schemas';
import { getSystemStatus, findUsersByVow, manageSyndicateAccess } from '@/ai/tools/demiurge-tools';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { z } from 'zod';

const consultDemiurgeFlow = ai.defineFlow({
    name: 'consultDemiurgeFlow',
    inputSchema: DemiurgeAgentInputSchema,
    outputSchema: DemiurgeAgentOutputSchema,
}, async (input) => {
    const { action, params, workspaceId, userId } = input;
    
    // Architect actions are high-value.
    await authorizeAndDebitAgentActions({ workspaceId, userId, actionType: 'COMPLEX_LLM' });

    let report: z.infer<typeof DemiurgeAgentReportPayloadSchema>;
    switch (action) {
        case 'get_system_status':
            report = { action: 'get_system_status' as const, report: await getSystemStatus() };
            break;
        case 'find_users_by_vow':
            report = { action: 'find_users_by_vow' as const, report: await findUsersByVow(params) };
            break;
        case 'manage_syndicate_access':
            report = { action: 'manage_syndicate_access' as const, report: await manageSyndicateAccess(params) };
            break;
        default:
             throw new Error(`Invalid Demiurge action`);
    }
    
    return { agent: 'demiurge', report };
});

export async function consultDemiurge(input: DemiurgeAgentInput): Promise<DemiurgeAgentOutput> {
  return consultDemiurgeFlow(input);
}
