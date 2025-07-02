
'use server';

import type { Workflow as PrismaWorkflow } from '@prisma/client';
import { StateGraph, END } from '@langchain/langgraph';
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
import { auditFinances } from '@/ai/agents/auditor-generalissimo';
import { generateWingmanMessage } from '@/ai/agents/wingman';
import { getKendraTake } from '@/ai/agents/kendra';
import { invokeOracle } from '@/ai/agents/orphean-oracle-flow';
import { analyzeInvite } from '@/ai/agents/lumbergh';
import { analyzeExpense } from '@/ai/agents/lucille-bluth';
import { generatePamRant } from '@/ai/agents/pam-poovey';
import { getStonksAdvice } from '@/ai/agents/stonks-bot';
import { analyzeCarShame } from '@/ai/agents/reno-mode';
import { processPatricktAction } from '@/ai/agents/patrickt-agent';
import { validateVin } from '@/ai/agents/vin-diesel';
import { consultInventoryDaemon } from '@/ai/agents/inventory-daemon';
import { getServerActionSession } from './auth';

interface ExecutionContext {
    workspaceId: string;
    userId: string;
    psyche: PrismaWorkflow['psyche'];
}

// A map of node types to their corresponding agent/tool functions.
const nodeExecutorMap: Record<string, (input: any, context: ExecutionContext) => Promise<any>> = {
    'tool-winston-wolfe': (input, context) => generateSolution({ ...input, workspaceId: context.workspaceId }),
    'tool-kif-kroker': (input, context) => analyzeComms({ ...input, workspaceId: context.workspaceId }),
    'tool-vandelay': (input, context) => createVandelayAlibi({ ...input, workspaceId: context.workspaceId }),
    'tool-rolodex': (input, context) => analyzeCandidate({ ...input, workspaceId: context.workspaceId }),
    'tool-dr-syntax': (input, context) => drSyntaxCritique({ ...input, workspaceId: context.workspaceId, psyche: context.psyche }),
    'tool-jroc': (input, context) => generateBusinessKit({ ...input, workspaceId: context.workspaceId }),
    'tool-lahey': (input, context) => analyzeLaheyLog({ ...input, workspaceId: context.workspaceId }),
    'tool-foremanator': (input, context) => processDailyLog({ ...input, workspaceId: context.workspaceId }),
    'tool-sterileish': (input, context) => analyzeCompliance({ ...input, workspaceId: context.workspaceId }),
    'tool-barbara': (input, context) => processDocument({ ...input, workspaceId: context.workspaceId }),
    'tool-paper-trail': (input, context) => scanEvidence({ ...input, workspaceId: context.workspaceId }),
    'tool-auditor-generalissimo': (input, context) => auditFinances({ ...input, workspaceId: context.workspaceId }),
    'tool-beep-wingman': (input, context) => generateWingmanMessage({ ...input, workspaceId: context.workspaceId }),
    'tool-kendra': (input, context) => getKendraTake({ ...input, workspaceId: context.workspaceId }),
    'tool-orphean-oracle': (input, context) => invokeOracle({ ...input, workspaceId: context.workspaceId }),
    'tool-lumbergh': (input, context) => analyzeInvite({ ...input, workspaceId: context.workspaceId }),
    'tool-lucille-bluth': (input, context) => analyzeExpense({ ...input, workspaceId: context.workspaceId }),
    'tool-pam-poovey': (input, context) => generatePamRant({ ...input, workspaceId: context.workspaceId }),
    'tool-stonks-bot': (input, context) => getStonksAdvice({ ...input, workspaceId: context.workspaceId, userId: context.userId }),
    'tool-reno-mode': (input, context) => analyzeCarShame({ ...input, workspaceId: context.workspaceId }),
    'tool-patrickt-app': (input, context) => processPatricktAction({ ...input, workspaceId: context.workspaceId, userId: context.userId }),
    'tool-vin-diesel': (input, context) => validateVin({ ...input, workspaceId: context.workspaceId }),
    'tool-inventory-daemon': (input, context) => consultInventoryDaemon({ ...input }),
};

// Safely gets a nested property from an object using a dot-notation string.
const getValueFromPath = (obj: any, path: string): any => {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
};

async function executeNode(node: Node, payload: any, context: ExecutionContext): Promise<any> {
    const { type, data } = node;
    const input = { ...payload, ...data };

    console.log(`[Executor] Executing node type: ${type} with label: ${data.label}`);

    const executor = nodeExecutorMap[type];
    if (executor) {
        return executor(input, context);
    }
    
    switch (type) {
        case 'trigger':
            return { status: 'triggered', initialPayload: payload };
        case 'tool-final-answer':
            return { finalOutput: payload };
        case 'logic': {
            const { variable, operator, value: comparisonValue } = data;
            const actualValue = getValueFromPath(payload, variable);
            let result = false;

            switch (operator) {
                case 'exists': result = actualValue !== undefined && actualValue !== null && actualValue !== ''; break;
                case 'not_exists': result = actualValue === undefined || actualValue === null || actualValue === ''; break;
                case 'eq': result = String(actualValue) == String(comparisonValue); break;
                case 'neq': result = String(actualValue) != String(comparisonValue); break;
                case 'gt': result = Number(actualValue) > Number(comparisonValue); break;
                case 'lt': result = Number(actualValue) < Number(comparisonValue); break;
                case 'contains': result = String(actualValue).includes(String(comparisonValue)); break;
                default: console.warn(`[Executor] Unknown logic operator: ${operator}`);
            }
            return { conditionMet: result };
        }
        case 'tool-crm': {
            const { action, ...crmData } = input;
            const { workspaceId, userId } = context;
            console.log(`[Executor] Executing CRM action: ${action} with input:`, crmData);
            switch (action) {
                case 'list': return { contacts: await listContactsFromDb(workspaceId, userId) }; 
                case 'create': return { newContact: await createContactInDb(crmData, workspaceId, userId) };
                case 'update': return { updatedContact: await updateContactInDb(crmData, workspaceId, userId) };
                case 'delete': return { deletionResult: await deleteContactInDb(crmData, workspaceId, userId) };
                default: throw new Error(`Unsupported CRM action in workflow: ${action}`);
            }
        }
        default:
            console.warn(`[Executor] Node type '${type}' is not implemented. Skipping.`);
            return { status: 'skipped', reason: `Node type '${type}' not implemented` };
    }
}

// The state of our execution graph
interface WorkflowState {
  payload: any;
  _logicResult?: boolean;
}

// Wrapper to create a graph node from a workflow node
const createGraphNode = (node: Node, context: ExecutionContext, log: (entry: any) => void) => {
    return async (state: WorkflowState): Promise<Partial<WorkflowState>> => {
      const result = await executeNode(node, state.payload, context);
      log({ nodeId: node.id, type: node.type, label: node.data.label, result });
      return {
        payload: { ...state.payload, ...result },
        _logicResult: node.type === 'logic' ? result.conditionMet : undefined,
      };
    };
};

export async function executeWorkflow(
    workflow: PrismaWorkflow, 
    payload: any, 
    context: ExecutionContext
): Promise<{ finalPayload: any; executionLog: any[] }> {
    const definition = workflow.definition as unknown as Workflow['definition'];
    if (!definition || !definition.nodes || !definition.edges) {
        throw new Error('Invalid workflow definition.');
    }

    const { nodes, edges } = definition;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const executionLog: any[] = [];
    const log = (entry: any) => executionLog.push(entry);

    try {
        const graph = new StateGraph<WorkflowState>({
            channels: {
                payload: { value: (x, y) => ({ ...x, ...y }), default: () => ({}) },
                _logicResult: { value: (x, y) => y, default: () => undefined },
            }
        });

        for (const node of nodes) {
            graph.addNode(node.id, createGraphNode(node, context, log));
        }

        const triggerNode = nodes.find(n => n.type === 'trigger');
        if (!triggerNode) { throw new Error('Workflow must have a trigger node.'); }
        graph.setEntryPoint(triggerNode.id);

        for (const edge of edges) {
            if (nodeMap.get(edge.source)?.type !== 'logic') {
                graph.addEdge(edge.source, edge.target);
            }
        }
        
        const logicNodes = nodes.filter(n => n.type === 'logic');
        for (const logicNode of logicNodes) {
            const router = (state: WorkflowState) => state._logicResult ? 'true' : 'false';
            const conditionalEdges = edges.filter(e => e.source === logicNode.id);
            const edgeMap: Record<string, string> = { 'true': END, 'false': END };
            
            for (const edge of conditionalEdges) {
                if (edge.condition === 'true') edgeMap['true'] = edge.target;
                if (edge.condition === 'false') edgeMap['false'] = edge.target;
            }
            graph.addConditionalEdges(logicNode.id, router, edgeMap);
        }

        const terminalNodes = nodes.filter(n => !edges.some(e => e.source === n.id));
        for (const node of terminalNodes) {
            if (node.id !== triggerNode.id) { // Don't add an end edge from the trigger if it has no connections
                 graph.addEdge(node.id, END);
            }
        }

        const app = graph.compile();
        const result = await app.invoke({ payload });

        return { finalPayload: result.payload, executionLog };
    } catch (e) {
        const error = e instanceof Error ? e : new Error("An unknown execution error occurred");
        (error as any).executionLog = executionLog;
        throw error;
    }
}
    
