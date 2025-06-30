
'use server';

import type { Workflow as PrismaWorkflow } from '@prisma/client';
import type { Workflow, Node, NodeType } from '@/components/loom/types';
import { createContactInDb, listContactsFromDb, updateContactInDb, deleteContactInDb } from '@/ai/tools/crm-tools';
import { drSyntaxCritique } from '@/ai/agents/dr-syntax';
import { generateSolution } from '@/ai/agents/winston-wolfe';
import { analyzeComms } from '@/ai/agents/kif-kroker';
import { createVandelayAlibi } from '@/ai/agents/vandelay';
import { analyzeCandidate } from '@/ai/agents/rolodex';
import { scanEvidence } from '@/ai/agents/paper-trail';
import { generateBusinessKit } from '@/ai/agents/jroc';
import { analyzeLaheyLog } from '@/ai/agents/lahey';
import { processDailyLog } from '@/ai/agents/foremanator';
import { analyzeCompliance } from '@/ai/agents/sterileish';
import { processDocument } from '@/ai/agents/barbara';

interface ExecutionContext {
    workspaceId: string;
}

// A map of node types to their corresponding agent/tool functions.
// This makes the executor dynamic and easy to extend.
const nodeExecutorMap: Record<string, (input: any) => Promise<any>> = {
    'tool-winston-wolfe': generateSolution,
    'tool-kif-kroker': analyzeComms,
    'tool-vandelay': createVandelayAlibi,
    'tool-rolodex': analyzeCandidate,
    'tool-dr-syntax': drSyntaxCritique,
    'tool-jroc': generateBusinessKit,
    'tool-lahey': analyzeLaheyLog,
    'tool-foremanator': processDailyLog,
    'tool-sterileish': analyzeCompliance,
    'tool-barbara': processDocument,
    'tool-paper-trail': scanEvidence,
    // Note: 'tool-crm' and 'logic' are handled separately due to their internal logic.
};

// Safely gets a nested property from an object using a dot-notation string.
const getValueFromPath = (obj: any, path: string): any => {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
};


async function executeNode(node: Node, payload: any, context: ExecutionContext): Promise<any> {
    const { type, data } = node;
    // The input to a node is a combination of the current payload and its own static configuration.
    const input = { ...payload, ...data, workspaceId: context.workspaceId };

    console.log(`[Executor] Executing node type: ${type} with label: ${data.label}`);

    // Dynamic executor for most tools
    const executor = nodeExecutorMap[type];
    if (executor) {
        return executor(input);
    }
    
    // Special handling for specific node types
    switch (type) {
        case 'trigger':
            return { status: 'triggered', initialPayload: payload };

        case 'tool-final-answer':
            console.log(`[Executor] Reached Final Answer node.`);
            return { finalOutput: payload };
            
        case 'logic': {
            const { variable, operator, value: comparisonValue } = data;
            const actualValue = getValueFromPath(payload, variable);
            let result = false;

            switch (operator) {
                case 'exists': result = actualValue !== undefined && actualValue !== null; break;
                case 'not_exists': result = actualValue === undefined || actualValue === null; break;
                case 'eq': result = actualValue == comparisonValue; break; // Use loose equality for flexibility
                case 'neq': result = actualValue != comparisonValue; break;
                case 'gt': result = Number(actualValue) > Number(comparisonValue); break;
                case 'lt': result = Number(actualValue) < Number(comparisonValue); break;
                case 'contains': result = String(actualValue).includes(comparisonValue); break;
                default: console.warn(`[Executor] Unknown logic operator: ${operator}`);
            }
            return { conditionMet: result };
        }

        case 'tool-crm': {
            const { action, ...crmData } = input;
            console.log(`[Executor] Executing CRM action: ${action} with input:`, crmData);
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
        }

        default:
            console.warn(`[Executor] Node type '${type}' is not implemented for execution. Skipping.`);
            return { status: 'skipped', reason: `Node type '${type}' not implemented` };
    }
}


/**
 * A workflow executor that traverses the graph based on edges, now with conditional branching.
 * @param workflow The workflow object from the database.
 * @param payload The trigger payload for the workflow run.
 * @param context The execution context (e.g., workspaceId).
 * @returns An object containing both the final payload and the detailed execution log.
 */
export async function executeWorkflow(
    workflow: PrismaWorkflow, 
    payload: any, 
    context: ExecutionContext
): Promise<{ finalPayload: any; executionLog: any[] }> {
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
    const executionLog: {nodeId: string, type: string, label: string, result: any}[] = [];
    const MAX_STEPS = 20; // Increased steps for branching
    let step = 0;

    try {
        while (currentNode && step < MAX_STEPS) {
            const result = await executeNode(currentNode, currentPayload, context);
            executionLog.push({ nodeId: currentNode.id, type: currentNode.type, label: currentNode.data.label, result });

            // The result of the previous node is merged into the payload for the next one.
            currentPayload = { ...currentPayload, ...result };
            
            let nextEdge;
            if (currentNode.type === 'logic' && currentPayload.conditionMet !== undefined) {
                // If it's a logic node, find the edge matching the condition result.
                const condition = String(currentPayload.conditionMet);
                nextEdge = edges.find(e => e.source === currentNode?.id && e.condition === condition);
                if (!nextEdge) {
                    console.warn(`[Executor] No path found for condition '${condition}' from node ${currentNode.id}. Ending workflow.`);
                }
            } else {
                // For all other nodes, find the unconditional outgoing edge.
                nextEdge = edges.find(e => e.source === currentNode?.id && !e.condition);
            }
            
            if (nextEdge) {
                currentNode = nodeMap.get(nextEdge.target);
            } else {
                currentNode = undefined; // End of the line
            }
            step++;
        }

        if (step >= MAX_STEPS) {
            console.warn(`[Executor] Workflow execution stopped after ${MAX_STEPS} steps to prevent infinite loop.`);
        }
    } catch (e) {
        // When an error occurs during execution, attach the log and re-throw
        const error = e instanceof Error ? e : new Error("An unknown execution error occurred");
        (error as any).executionLog = executionLog;
        throw error;
    }


    console.log("[Executor] Workflow execution complete. Final payload:", currentPayload);
    // Return both the final payload and the execution log.
    return { finalPayload: currentPayload, executionLog };
}
