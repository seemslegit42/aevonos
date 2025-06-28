
'use server';

import type { Workflow as PrismaWorkflow } from '@prisma/client';
import type { Workflow, Node } from '@/app/loom/page';
import { createContactInDb, listContactsFromDb, updateContactInDb, deleteContactInDb } from '@/ai/tools/crm-tools';
import { drSyntaxCritique } from '@/ai/agents/dr-syntax';
import { generateSolution } from '@/ai/agents/winston-wolfe';
import { analyzeComms } from '@/ai/agents/kif-kroker';
import { createVandelayAlibi } from '@/ai/agents/vandelay';
import { scanEvidence } from '@/ai/agents/paper-trail';
import { generateBusinessKit } from '@/ai/agents/jroc';
import { analyzeLaheyLog } from '@/ai/agents/lahey';
import { processDailyLog } from '@/ai/agents/foremanator';
import { analyzeCompliance } from '@/ai/agents/sterileish';

interface ExecutionContext {
    workspaceId: string;
}

async function executeNode(node: Node, payload: any, context: ExecutionContext): Promise<any> {
    const { type, data } = node;
    // Combine the dynamic payload from the previous node with static data configured on the current node.
    const input = { ...payload, ...data };

    console.log(`Executing node type: ${type} with label: ${data.label}`);

    switch (type) {
        case 'trigger':
            return { status: 'triggered', initialPayload: payload };

        case 'tool-final-answer':
            console.log(`Reached Final Answer node.`);
            return { finalOutput: payload };

        case 'tool-crm':
            const { action, ...crmData } = input;
            console.log(`Executing CRM action: ${action} with input:`, crmData);
            switch (action) {
                case 'list':
                    return { contacts: await listContactsFromDb(context.workspaceId) };
                case 'create':
                    return { newContact: await createContactInDb(crmData, context.workspaceId) };
                case 'update':
                    if (!crmData.id) throw new Error("Update action requires a contact ID.");
                    return { updatedContact: await updateContactInDb(crmData, context.workspaceId) };
                case 'delete':
                    if (!crmData.id) throw new Error("Delete action requires a contact ID.");
                    return { deletionResult: await deleteContactInDb(crmData, context.workspaceId) };
                default:
                    throw new Error(`Unsupported CRM action in workflow: ${action}`);
            }

        case 'tool-dr-syntax':
            return await drSyntaxCritique(input);
        
        case 'tool-winston-wolfe':
            return await generateSolution(input);

        case 'tool-kif-kroker':
             return await analyzeComms(input);
        
        case 'tool-vandelay':
            return await createVandelayAlibi(input);

        case 'tool-paper-trail':
            if (!input.receiptPhotoUri) throw new Error("Paper Trail node requires a receiptPhotoUri in its payload.");
            return await scanEvidence(input);
        
        case 'tool-jroc':
            return await generateBusinessKit(input);

        case 'tool-lahey':
            return await analyzeLaheyLog(input);

        case 'tool-foremanator':
            return await processDailyLog(input);
        
        case 'tool-sterileish':
            return await analyzeCompliance(input);
            
        default:
            console.log(`Node type '${type}' is not implemented for execution. Skipping.`);
            return { status: 'skipped', reason: `Node type '${type}' not implemented` };
    }
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
