
'use server';

import type { Workflow as PrismaWorkflow } from '@prisma/client';
import { createContactInDb, listContactsFromDb, updateContactInDb, deleteContactInDb } from '@/ai/tools/crm-tools';
import type { Workflow } from '@/app/loom/page';

interface ExecutionContext {
    workspaceId: string;
}

/**
 * A simplified workflow executor. It finds the first executable tool node
 * in a workflow definition and runs it with the provided payload and context.
 * In a more advanced system, this would be a full graph traversal engine.
 * @param workflow The workflow object from the database.
 * @param payload The trigger payload for the workflow run.
 * @param context The execution context (e.g., workspaceId).
 * @returns The result of the executed tool.
 */
export async function executeWorkflow(
    workflow: PrismaWorkflow, 
    payload: any, 
    context: ExecutionContext
): Promise<any> {
    const definition = workflow.definition as unknown as Workflow['definition'];
    if (!definition || !definition.nodes) {
        throw new Error('Invalid workflow definition: missing nodes.');
    }

    // For this implementation, we find the first CRM tool node and execute it.
    const crmNode = definition.nodes.find(node => node.type === 'tool-crm');

    if (!crmNode) {
        console.warn(`Workflow ${workflow.id} has no CRM node to execute.`);
        return { message: 'Workflow has no executable CRM action.' };
    }
    
    // The node's 'data' property holds the configuration set in the Loom Studio inspector.
    const { action, ...nodeData } = crmNode.data;

    switch (action) {
        case 'list':
            return await listContactsFromDb(context.workspaceId);
        
        case 'create':
            // For create, we combine data from the trigger payload and the node's static data.
            const createInput = { ...payload, ...nodeData };
            return await createContactInDb({
                firstName: createInput.firstName,
                lastName: createInput.lastName,
                email: createInput.email,
                phone: createInput.phone,
            }, context.workspaceId);
        
        case 'update':
            const updateInput = { ...payload, ...nodeData };
            if (!updateInput.id) throw new Error("Update action requires a contact ID in the payload or node data.");
            return await updateContactInDb(updateInput, context.workspaceId);

        case 'delete':
             const deleteInput = { ...payload, ...nodeData };
             if (!deleteInput.id) throw new Error("Delete action requires a contact ID in the payload or node data.");
             return await deleteContactInDb(deleteInput, context.workspaceId);

        default:
            throw new Error(`Unsupported CRM action in workflow: ${action}`);
    }
}
