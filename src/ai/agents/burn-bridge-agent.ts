
'use server';
/**
 * @fileOverview The Burn Bridge Protocol, a specialist LangGraph agent.
 * This meta-agent orchestrates OSINT, analysis, and decoy deployment to generate a final dossier.
 */
import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { performOsintScan } from './osint';
import { performInfidelityAnalysis } from './infidelity-analysis';
import { deployDecoy } from './decoy';
import { generateDossier } from './dossier-agent';
import { type BurnBridgeInput } from './burn-bridge-schemas';
import { OsintOutput } from './osint-schemas';
import { InfidelityAnalysisOutput } from './infidelity-analysis-schemas';
import { DecoyOutput } from './decoy-schemas';
import { DossierOutput } from './dossier-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

// 1. Define Agent State
interface BurnBridgeState {
  messages: BaseMessage[];
  input: BurnBridgeInput;
  osintReport?: OsintOutput;
  analysisResult?: InfidelityAnalysisOutput;
  decoyResult?: DecoyOutput;
  finalDossier?: DossierOutput;
}

// 2. Define Agent Nodes

// Node to run parallel scans
const runParallelScans = async (state: BurnBridgeState): Promise<Partial<BurnBridgeState>> => {
  const { input } = state;
  console.log('[Burn Bridge] Initiating parallel scans...');
  
  // Cost for this complex orchestration
  await authorizeAndDebitAgentActions({
    workspaceId: input.workspaceId,
    userId: input.userId,
    actionType: 'COMPLEX_LLM',
    costMultiplier: 5, // This is a very high-value, multi-agent action
  });

  const [osintReport, analysisResult, decoyResult] = await Promise.all([
    performOsintScan({ targetName: input.targetName, context: input.osintContext, workspaceId: input.workspaceId, userId: input.userId }).catch(e => { console.error("OSINT scan failed:", e); return null; }),
    performInfidelityAnalysis({ situationDescription: input.situationDescription, workspaceId: input.workspaceId }).catch(e => { console.error("Analysis failed:", e); return null; }),
    deployDecoy({ targetDescription: `Name: ${input.targetName}. Situation: ${input.situationDescription}`, workspaceId: input.workspaceId }).catch(e => { console.error("Decoy deployment failed:", e); return null; })
  ]);
  
  console.log('[Burn Bridge] Parallel scans complete.');
  return {
    osintReport: osintReport || undefined,
    analysisResult: analysisResult || undefined,
    decoyResult: decoyResult || undefined,
  };
};

// Node to synthesize and generate the dossier
const generateFinalDossier = async (state: BurnBridgeState): Promise<Partial<BurnBridgeState>> => {
    const { input, osintReport, analysisResult, decoyResult } = state;
    console.log('[Burn Bridge] Generating final dossier...');

    const dossier = await generateDossier({
        targetName: input.targetName,
        osintReport: osintReport,
        analysisResult: analysisResult,
        decoyResult: decoyResult,
        workspaceId: input.workspaceId,
        userId: input.userId,
    });
    
    console.log('[Burn Bridge] Dossier generated.');
    return { finalDossier: dossier };
};


// 3. Build Graph
const workflow = new StateGraph<BurnBridgeState>({
  channels: {
    messages: { value: (x, y) => x.concat(y), default: () => [] },
    input: { value: (x, y) => y, default: () => ({} as BurnBridgeInput) },
    osintReport: { value: (x, y) => y, default: () => undefined },
    analysisResult: { value: (x, y) => y, default: () => undefined },
    decoyResult: { value: (x, y) => y, default: () => undefined },
    finalDossier: { value: (x, y) => y, default: () => undefined },
  },
});

workflow.addNode('parallel_scans', runParallelScans);
workflow.addNode('generate_dossier', generateFinalDossier);

workflow.setEntryPoint('parallel_scans');
workflow.addEdge('parallel_scans', 'generate_dossier');
workflow.addEdge('generate_dossier', END);

const burnBridgeApp = workflow.compile();

// 4. Create exported flow
export async function executeBurnBridgeProtocol(input: BurnBridgeInput): Promise<DossierOutput> {
    const result = await burnBridgeApp.invoke({ input });

    if (!result.finalDossier) {
        throw new Error('The Burn Bridge Protocol failed to generate a final dossier.');
    }

    return result.finalDossier;
}
