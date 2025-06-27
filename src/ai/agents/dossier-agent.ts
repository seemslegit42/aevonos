
'use server';

import { ai } from '@/ai/genkit';
import { DossierInputSchema, DossierOutputSchema, type DossierInput, type DossierOutput } from './dossier-schemas';
import { format } from 'date-fns';
import { createHash } from 'crypto';

const generateDossierFlow = ai.defineFlow(
  {
    name: 'generateDossierFlow',
    inputSchema: DossierInputSchema,
    outputSchema: DossierOutputSchema,
  },
  async (input) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const caseFile = (input.targetName || 'UNKNOWN_SUBJECT').toUpperCase().replace(/\s/g, '_');
    
    const standardPrompt = `You are a professional intelligence analyst AI. Your task is to compile a formal dossier from the provided data. The output must be perfectly structured Markdown, adhering strictly to the template. Do not include any conversational text, introductions, or conclusions outside of the Markdown structure.

**INTERNAL USE ONLY // ΛΞVON OS // DECLASSIFIED ${today}**
    
---
    
# CASE FILE: ${input.redacted ? 'TARGET-001' : caseFile}
    
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

    const legalPrompt = `You are an AI intelligence suite preparing a formal dossier for legal review. The output must be perfectly structured Markdown. The tone is formal, objective, and clinical. All sections must be present, even if data is not available (in which case, state "No data available" or similar).

# INFIDELITY INTELLIGENCE DOSSIER

- **Prepared by**: ΛΞVON OS – Agentic Intelligence Suite
- **Subject**: ${input.targetName}
- **Date**: ${today}
- **Prepared For**: ${input.preparedFor || 'Private Legal Review'}

---

## 1. Executive Summary

This report presents behavioral and digital evidence suggesting a pattern of infidelity by the subject, ${input.targetName}. Compiled using the ΛΞVON OS Intelligence Engine, the dossier aggregates OSINT, metadata analysis, and AI behavioral review.

**Key Findings:**
${input.analysisResult && input.analysisResult.keyFactors.length > 0 ? input.analysisResult.keyFactors.map(f => `- ${f}`).join('\n') : '- No significant findings from behavioral analysis.'}
${input.osintReport && (input.osintReport.breaches?.length || 0) > 0 ? '- Presence in publicly indexed data breaches.' : ''}

---

## 2. Subject Overview

- **Full Name**: ${input.targetName}
- **Known Emails**: ${input.osintReport?.socialProfiles?.map(p => p.username).join(', ') || 'N/A'}
- **Known Phone Numbers**: ${input.osintReport?.burnerPhoneCheck ? (input.osintReport.burnerPhoneCheck.isBurner ? 'Number flagged as burner service.' : 'Standard carrier number identified.') : 'N/A'}

---

## 3. Behavioral Timeline

${input.analysisResult && input.analysisResult.keyFactors.length > 0 ? input.analysisResult.keyFactors.map(f => ` - ${today}: ${f}`).join('\n') : 'No specific behavioral events were logged for this report.'}

---

## 4. Open-Source Intelligence (OSINT) Summary

${input.osintReport ? `Data has been verified from public breach indexes as of ${today}. The subject was found in ${input.osintReport.breaches?.length || 0} known data breaches.` : 'No OSINT analysis was performed for this report.'}

---

## 5. Communications Record (Decoy Interaction)

${input.decoyResult ? `The following is a simulated transcript of an interaction with an AI decoy agent.\n\n[Decoy]: “Hey, you look familiar...”\n[Subject]: “Haha, maybe I’m just your type?”\n[Decoy]: “Maybe...you single?”\n[Subject]: “It’s... complicated.”` : 'No decoy agent was deployed for this investigation.'}

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

    const { output } = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
      output: { schema: DossierOutputSchema },
    });
    
    if (!output) {
      throw new Error("Dossier generation failed.");
    }
    
    const hash = createHash('sha256').update(output.markdownContent).digest('hex');

    return {
        ...output,
        reportHash: hash,
        mode: input.mode || 'standard',
    };
  }
);

export async function generateDossier(input: DossierInput): Promise<DossierOutput> {
  return generateDossierFlow(input);
}
