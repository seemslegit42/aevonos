
'use server';
/**
 * @fileOverview The Dossier agent, now a LangGraph state machine.
 * It is responsible for synthesizing intelligence from multiple sources into a final report.
 */

import { StateGraph, END } from '@langchain/langgraph';
import { BaseMessage, HumanMessage } from '@langchain/core/messages';
import { z } from 'zod';
import { DossierInputSchema, DossierOutputSchema, type DossierInput, type DossierOutput } from './dossier-schemas';
import { format } from 'date-fns';
import { createHash } from 'crypto';
import { langchainGroqComplex } from '@/ai/genkit';

// 1. Define Agent State
interface DossierAgentState {
  messages: BaseMessage[];
  input: DossierInput;
  finalReport: DossierOutput | null;
}

// 2. Define Agent Nodes
const synthesizeDossierNode = async (state: DossierAgentState): Promise<Partial<DossierAgentState>> => {
    const { input } = state;
    const today = format(new Date(), 'yyyy-MM-dd');
    const caseFileName = (input.targetName || 'UNKNOWN_SUBJECT').toLowerCase().replace(/\s/g, '-');
    
    const promptText = `You are a master intelligence analyst and synthesizer. Your callsign is "Chronicler". You have received disparate reports from several specialist field agents (OSINT, Behavioral Analysis, Decoy). Your critical task is not to merely list their findings, but to **synthesize** them into a single, cohesive, and insightful intelligence dossier.

**Core Directives:**
- **Synthesize, Don't Summarize:** Look for connections, contradictions, and patterns across the reports. A data breach in the OSINT report might corroborate a behavioral red flag. A decoy interaction might contradict the subject's stated behavior. Your value is in finding these links.
- **Maintain Tone:** The tone must be formal, objective, and clinical. Use standard intelligence report formatting.
- **Strict Adherence to Markdown:** The output MUST be perfectly structured Markdown as per the provided template.

---
**INPUT INTELLIGENCE REPORTS**

**OSINT Report (Callsign: Bloodhound):**
\`\`\`json
${JSON.stringify(input.osintReport, null, 2) || "No OSINT report provided."}
\`\`\`

**Behavioral Analysis (Callsign: Spectre):**
\`\`\`json
${JSON.stringify(input.analysisResult, null, 2) || "No behavioral analysis provided."}
\`\`\`

**Decoy Interaction Log (Callsign: Echo):**
\`\`\`json
${JSON.stringify(input.decoyResult, null, 2) || "No decoy interaction logged."}
\`\`\`
---

**DOSSIER GENERATION TEMPLATE & INSTRUCTIONS**

Compile the final dossier in this exact Markdown format. Under "EXECUTIVE SYNOPSIS", you must provide your synthesized analysis.

# CASE FILE: ${input.redacted ? 'TARGET-001' : caseFileName.toUpperCase()}

- **SUBJECT**: ${input.redacted ? 'TARGET-001' : input.targetName}
- **DATE OF COMPILATION**: ${today}
- **INVESTIGATOR**: The Architect (via BEEP Swarm)

---

## ▣ EXECUTIVE SYNOPSIS

*This is the most critical section. Based on a holistic review of all provided reports, write a 2-3 sentence summary of the intelligence picture. Highlight key correlations or contradictions (e.g., "Subject's public profile as a family man is contradicted by burner phone usage and flirtatious decoy interaction."). Conclude with a final assessment of the subject's risk profile.*

- **OVERALL RISK ASSESSMENT**: ${input.analysisResult?.riskScore ? `${input.analysisResult.riskScore}% (${input.analysisResult.riskScore > 75 ? 'HIGH' : input.analysisResult.riskScore > 40 ? 'MEDIUM' : 'LOW'})` : 'Not Assessed'}

---

## ▣ OSINT FINDINGS (Bloodhound's Report)

- **Digital Visibility**: ${input.osintReport?.digitalFootprint?.overallVisibility || 'N/A'}
- **Data Breaches**: ${input.osintReport?.breaches?.length || 0} found.
- **IntelX Leaks**: ${input.osintReport?.intelXLeaks?.length || 0} found.
- **Phone Status**: ${input.osintReport?.burnerPhoneCheck?.isBurner ? 'FLAGGED AS BURNER' : 'Standard Carrier'}

---

## ▣ BEHAVIORAL ANALYSIS (Spectre's Report)

- **Key Factors Flagged**: 
${input.analysisResult?.keyFactors.map(f => `  - ${f}`).join('\n') || '  - No specific behavioral red flags identified.'}

---

## ▣ COUNTER-INTELLIGENCE TRANSCRIPT (Echo's Report)

- **Message Deployed (Persona: ${input.decoyResult?.persona || 'N/A'})**: "${input.decoyResult?.decoyMessage || 'No decoy was deployed.'}"

---
`;

    const structuredGroq = langchainGroqComplex.withStructuredOutput(z.object({ markdownContent: z.string() }));
    const { markdownContent } = await structuredGroq.invoke(promptText);

    if (!markdownContent) {
        throw new Error("Dossier synthesis failed.");
    }
    
    const fileName = `dossier-${caseFileName}${input.mode === 'legal' ? '-legal' : ''}.pdf`;
    const hash = createHash('sha256').update(markdownContent).digest('hex');

    const finalReport: DossierOutput = {
        markdownContent,
        fileName,
        reportHash: hash,
        mode: input.mode || 'standard',
        targetName: input.targetName,
    };
    
    return { finalReport };
};

// 3. Build the Graph
const workflow = new StateGraph<DossierAgentState>({
  channels: {
    messages: { value: (x, y) => x.concat(y), default: () => [] },
    input: { value: (x, y) => y, default: () => ({} as DossierInput) },
    finalReport: { value: (x, y) => y, default: () => null },
  },
});

workflow.addNode('synthesize', synthesizeDossierNode);
workflow.setEntryPoint('synthesize');
workflow.addEdge('synthesize', END);

const dossierApp = workflow.compile();

// 4. Exported function that conforms to the previous signature
export async function generateDossier(input: DossierInput): Promise<DossierOutput> {
  const result = await dossierApp.invoke({ input });

  if (!result.finalReport) {
      throw new Error("The Dossier Agent failed to generate a final report.");
  }
  
  return result.finalReport;
}
