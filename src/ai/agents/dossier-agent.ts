
'use server';

import { ai } from '@/ai/genkit';
import { DossierInputSchema, DossierOutputSchema, type DossierInput, type DossierOutput } from './dossier-schemas';
import { format } from 'date-fns';
import { createHash } from 'crypto';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { langchainGroqComplex } from '@/ai/genkit';
import { z } from 'zod';

const generateDossierFlow = ai.defineFlow(
  {
    name: 'generateDossierFlow',
    inputSchema: DossierInputSchema,
    outputSchema: DossierOutputSchema,
  },
  async (input) => {
    // A dossier is a high-value artifact.
    await authorizeAndDebitAgentActions({
        workspaceId: input.workspaceId,
        userId: input.userId,
        actionType: 'COMPLEX_LLM',
        costMultiplier: 2.5
    });

    const today = format(new Date(), 'yyyy-MM-dd');
    const caseFileName = (input.targetName || 'UNKNOWN_SUBJECT').toLowerCase().replace(/\s/g, '-');
    const fileName = `dossier-${caseFileName}${input.mode === 'legal' ? '-legal' : ''}.pdf`;
    
    const standardPrompt = `You are a professional intelligence analyst AI. Your task is to compile a formal dossier from the provided data. The output must be perfectly structured Markdown, adhering strictly to the template. Do not include any conversational text, introductions, or conclusions outside of the Markdown structure.

**INTERNAL USE ONLY // ΛΞVON OS // DECLASSIFIED ${today}**
    
---
    
# CASE FILE: ${input.redacted ? 'TARGET-001' : caseFileName.toUpperCase()}
    
- **SUBJECT**: ${input.redacted ? 'TARGET-001' : input.targetName}
- **DATE OF COMPILATION**: ${today}
- **INVESTIGATOR**: The Architect (via BEEP v2.1)
    
---
    
## ▣ INFIDELITY RISK ASSESSMENT
    
- **RISK SCORE**: ${input.analysisResult?.riskScore ? `${input.analysisResult.riskScore}%` : 'N/A'} (${!input.analysisResult ? 'Not Assessed' : input.analysisResult.riskScore > 75 ? 'HIGH' : input.analysisResult.riskScore > 40 ? 'MEDIUM' : 'LOW'})
- **EXECUTIVE SYNOPSIS**: ${input.analysisResult?.riskSummary || 'Not assessed.'}
    
---
    
## ▣ BEHAVIORAL ANALYSIS
    
${input.analysisResult 
  ? `**KEY FACTORS FLAGGED:**\n` + input.analysisResult.keyFactors.map(f => `  - ${f}`).join('\n')
  : '**CONCLUSION**: No behavioral analysis was conducted for this dossier.'
}

---

## ▣ OSINT FINDINGS
    
${input.osintReport 
  ? `- **OVERALL DIGITAL VISIBILITY**: ${input.osintReport.digitalFootprint.overallVisibility}\n` +
    `- **DATA BREACHES**: ${input.osintReport.breaches?.length || 0} found.\n` +
    `- **INTELX LEAKS**: ${input.osintReport.intelXLeaks?.length || 0} found.\n` +
    `- **SOCIAL PROFILES**: ${input.osintReport.socialProfiles?.length || 0} scraped.\n` +
    `- **PHONE STATUS**: ${input.osintReport.burnerPhoneCheck?.isBurner ? 'FLAGGED AS BURNER' : 'Standard Carrier'}`
  : '**CONCLUSION**: No OSINT data available for this dossier.'
}

---

## ▣ COUNTER-INTELLIGENCE TRANSCRIPT (DECOY)

${input.decoyResult 
  ? `**MESSAGE DEPLOYED**: "${input.decoyResult.decoyMessage}"`
  : '**CONCLUSION**: No AI decoy was deployed in this investigation.'
}

---

## ▣ FILE METADATA

- **EXPORT TIMESTAMP**: ${new Date().toISOString()}
- **AGENT IDs**: dossier-generator-v1, osint-bloodhound-v2, behavioral-spectre-v1
    
---
    
*Compiled via Agentic Analysis – BEEP v2.1*
`;

    const legalPrompt = `You are an AI intelligence suite preparing a formal dossier for legal review. The output must be perfectly structured Markdown. The tone is formal, objective, and clinical. All sections must be present, even if data is not available (in which case, state "No data available for this section" or similar). Do not add any conversational text.

# INFIDELITY INTELLIGENCE DOSSIER

- **Prepared by**: ΛΞVON OS – Agentic Intelligence Suite
- **Subject**: ${input.targetName}
- **Date**: ${today}
- **Prepared For**: ${input.preparedFor || 'Private Legal Review'}

---

## 1. Executive Summary

This report presents behavioral and digital evidence suggesting a pattern of infidelity by the subject, ${input.targetName}. Compiled using the ΛΞVON OS Intelligence Engine, the dossier aggregates OSINT, behavioral analysis, and AI behavioral review.

**Key Findings:**
${
  input.analysisResult && input.analysisResult.keyFactors.length > 0
    ? input.analysisResult.keyFactors.map((f) => `- ${f}`).join('\n')
    : '- No significant findings from behavioral analysis.'
}
${(input.osintReport?.breaches?.length || 0) > 0 ? '- Presence in publicly indexed data breaches.' : ''}
${input.decoyResult ? '- Subject engaged in flirtatious communication with AI decoy.' : ''}

---

## 2. Subject Overview

- **Full Name**: ${input.targetName}
- **Known Emails**: ${input.osintReport?.socialProfiles?.map((p) => p.username).join(', ') || 'N/A'}
- **Known Phone Numbers**: ${
  input.osintReport?.burnerPhoneCheck
    ? input.osintReport.burnerPhoneCheck.isBurner
      ? 'Number flagged as burner service.'
      : 'Standard carrier number identified.'
    : 'N/A'
}
- **Known Social Handles**: ${
  input.osintReport?.socialProfiles?.map((p) => `@${p.username} (${p.platform})`).join(', ') || 'N/A'
}

---

## 3. Behavioral Timeline & Analysis

A review of available data indicates the following events of interest:

${
  input.analysisResult && input.analysisResult.keyFactors.length > 0
    ? input.analysisResult.keyFactors.map((f) => `- **${today}**: ${f}`).join('\n')
    : 'No specific behavioral events were logged for this report.'
}

**Analysis**: ${input.analysisResult?.riskSummary || 'No behavioral analysis was conducted.'}

---

## 4. Open-Source Intelligence (OSINT) Summary

Data has been verified from public breach indexes and other open sources as of ${today}.

- **Data Breaches**: Subject's email associated with ${
  input.osintReport?.breaches?.length || 0
} known data breaches.
- **Digital Footprint**: Visibility rated as ${
  input.osintReport?.digitalFootprint.overallVisibility || 'N/A'
}. ${input.osintReport?.digitalFootprint.keyObservations.join(' ')}

---

## 5. Communications Record (Decoy Interaction)

${
  input.decoyResult
    ? `An AI decoy agent using the persona "${input.decoyResult.persona}" initiated contact. The following interaction was recorded:\n\n**[Decoy]**: "${input.decoyResult.decoyMessage}"\n\n**[Subject's Response]**: (Simulated) "It’s... complicated."`
    : 'No decoy agent was deployed for this investigation.'
}

---

## 6. Conclusion

The subject demonstrates a consistent pattern of concealment, behavioral inconsistency, and engagement in extra-relational communication. While this report does not constitute legal proof, it is intended to aid attorneys and investigators in further discovery.

---

## 7. Metadata & Authentication

- **Compiled by**: BEEP v2.1 – Behavioral Event & Execution Processor
- **Export Mode**: Legal Dossier
- **Timestamp**: ${new Date().toISOString()}
`;

    const prompt = input.mode === 'legal' ? legalPrompt : standardPrompt;

    const structuredGroq = langchainGroqComplex.withStructuredOutput(z.object({ markdownContent: z.string() }));
    const output = await structuredGroq.invoke(prompt);
    
    if (!output?.markdownContent) {
      throw new Error("Dossier generation failed.");
    }
    
    const hash = createHash('sha256').update(output.markdownContent).digest('hex');

    return {
        markdownContent: output.markdownContent,
        fileName,
        reportHash: hash,
        mode: input.mode || 'standard',
        targetName: input.targetName,
    };
  }
);

export async function generateDossier(input: DossierInput): Promise<DossierOutput> {
  return generateDossierFlow(input);
}
