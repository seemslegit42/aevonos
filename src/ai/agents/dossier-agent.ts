
'use server';

import { ai } from '@/ai/genkit';
import { DossierInputSchema, DossierOutputSchema, type DossierInput, type DossierOutput } from './dossier-schemas';
import { format } from 'date-fns';

const generateDossierFlow = ai.defineFlow(
  {
    name: 'generateDossierFlow',
    inputSchema: DossierInputSchema,
    outputSchema: DossierOutputSchema,
  },
  async (input) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const caseFile = (input.targetName || 'UNKNOWN_SUBJECT').toUpperCase().replace(/\s/g, '_');
    const prompt = `You are a professional intelligence analyst AI. Your task is to compile a formal dossier from the provided data. The output must be perfectly structured Markdown, adhering strictly to the template. Do not include any conversational text, introductions, or conclusions outside of the Markdown structure.

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

    const { output } = await ai.generate({
      prompt: prompt,
      model: 'googleai/gemini-2.0-flash',
      output: { schema: DossierOutputSchema },
    });
    
    return output!;
  }
);

export async function generateDossier(input: DossierInput): Promise<DossierOutput> {
  return generateDossierFlow(input);
}
