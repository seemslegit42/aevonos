
'use server';

import type { Workflow as PrismaWorkflow } from '@prisma/client';
import { createContactInDb, listContactsFromDb, updateContactInDb, deleteContactInDb } from '@/ai/tools/crm-tools';
import type { Workflow, Node } from '@/app/loom/page';

interface ExecutionContext {
    workspaceId: string;
}

async function executeNode(node: Node, payload: any, context: ExecutionContext): Promise<any> {
    const { type, data } = node;

    // We'll only implement the CRM tool for now to demonstrate graph traversal.
    if (type === 'tool-crm') {
        const { action, ...nodeData } = data;
        const input = { ...payload, ...nodeData };
        
        console.log(`Executing CRM action: ${action} with input:`, input);

        switch (action) {
            case 'list':
                // The result of this action should be an array of contacts.
                return { contacts: await listContactsFromDb(context.workspaceId) };
            
            case 'create':
                 // The result will be the newly created contact object.
                return { newContact: await createContactInDb({
                    firstName: input.firstName,
                    lastName: input.lastName,
                    email: input.email,
                    phone: input.phone,
                }, context.workspaceId) };
            
            case 'update':
                if (!input.id) throw new Error("Update action requires a contact ID.");
                return { updatedContact: await updateContactInDb(input, context.workspaceId) };

            case 'delete':
                 if (!input.id) throw new Error("Delete action requires a contact ID.");
                 return { deletionResult: await deleteContactInDb(input, context.workspaceId) };

            default:
                throw new Error(`Unsupported CRM action in workflow: ${action}`);
        }
    }
    
    if (type === 'trigger') {
        console.log(`Executing trigger: ${data.label}`);
        return { status: 'triggered', initialPayload: payload };
    }

    if (type === 'tool-final-answer') {
        console.log(`Reached Final Answer node.`);
        return { finalOutput: payload };
    }

    console.log(`Node type '${type}' is not implemented for execution. Skipping.`);
    return { status: 'skipped', reason: `Node type '${type}' not implemented` };
}


/**
 * A simple, linear workflow executor that traverses the graph based on edges.
 * It passes the output of one node as the input to the next.
 * @param workflow The workflow object from the database.
 * @param payload The trigger payload for the workflow run.
 * @param context The execution context (e.g., workspaceId).
 * @returns The result of the final node in the execution path.
 */
export async function executeWorkflow(
    workflow: PrismaWorkflow, 
    payload: any, 
    context: ExecutionContext
): Promise<any> {
    const definition = workflow.definition as unknown as Workflow['definition'];
    if (!definition || !definition.nodes || !definition.edges) {
        throw new Error('Invalid workflow definition: missing nodes or edges.');
    }

    const { nodes, edges } = definition;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    
    // Find the starting node (a 'trigger' node with no incoming edges)
    const allTargetIds = new Set(edges.map(e => e.target));
    let currentNode: Node | undefined = nodes.find(n => n.type === 'trigger' && !allTargetIds.has(n.id));

    if (!currentNode) {
        throw new Error("Could not find a valid starting node (a 'trigger' node with no incoming edges).");
    }

    let currentPayload = { ...payload };
    const executionLog: {nodeId: string, type: string, result: any}[] = [];
    const MAX_STEPS = 10; // Prevent infinite loops
    let step = 0;

    while (currentNode && step < MAX_STEPS) {
        const result = await executeNode(currentNode, currentPayload, context);
        executionLog.push({ nodeId: currentNode.id, type: currentNode.type, result });

        // The result of the previous node is merged into the payload for the next one.
        currentPayload = { ...currentPayload, ...result };
        
        const nextEdge = edges.find(e => e.source === currentNode?.id);
        if (nextEdge) {
            currentNode = nodeMap.get(nextEdge.target);
        } else {
            currentNode = undefined; // End of the line
        }
        step++;
    }

    if (step >= MAX_STEPS) {
        console.warn(`Workflow execution stopped after ${MAX_STEPS} steps to prevent infinite loop.`);
    }

    console.log("Workflow execution complete. Final payload:", currentPayload);
    // Return the payload from the final node.
    return currentPayload;
}
