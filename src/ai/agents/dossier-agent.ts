
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
    const prompt = `You are a professional intelligence analyst tasked with compiling a formal dossier. Your output must be in well-structured Markdown format. Do not include any commentary outside of the markdown structure.

    The dossier is for the target: **${input.redacted ? 'TARGET-001' : input.targetName}**.
    The investigator is: **The Architect**.
    The date is: **${today}**.
    
    Compile all the provided intelligence into a single, cohesive Markdown document with the following sections. If a section has no data, you must explicitly state that (e.g., "No behavioral analysis conducted.").

    # Infidelity Radar: Intelligence Dossier
    
    - **Subject**: ${input.redacted ? 'TARGET-001' : input.targetName}
    - **Date Generated**: ${today}
    - **Investigator**: The Architect

    ---

    ## Summary Panel

    **Gut Check Synopsis**: 
    ${input.analysisResult?.riskSummary || 'Not assessed.'}

    **Infidelity Risk Score**: ${input.analysisResult?.riskScore ? `${input.analysisResult.riskScore}%` : 'N/A'}
    
    **Verdict**: ${!input.analysisResult ? 'Not Assessed' : input.analysisResult.riskScore > 75 ? 'High Risk' : input.analysisResult.riskScore > 40 ? 'Medium Risk' : 'Low Risk'}

    ---

    ## Behavioral Analysis
    
    ${input.analysisResult ? 
        `**Key Factors Flagged:**\n` + input.analysisResult.keyFactors.map(f => `- ${f}`).join('\n')
        : 'No behavioral analysis was conducted for this dossier.'
    }

    ---

    ## OSINT Findings
    
    ${input.osintReport ? 
        `**Overall Digital Visibility**: ${input.osintReport.digitalFootprint.overallVisibility}\n\n` +
        `**Data Breaches Found**: ${input.osintReport.breaches?.length || 0}\n` +
        `**IntelX Leaks Found**: ${input.osintReport.intelXLeaks?.length || 0}\n` +
        `**Social Profiles Scraped**: ${input.osintReport.socialProfiles?.length || 0}\n` +
        `**Burner Phone Check**: ${input.osintReport.burnerPhoneCheck?.isBurner ? 'Flagged as Burner' : 'Appears Normal'}`
        : 'No OSINT data available for this dossier.'
    }

    ---

    ## Decoy Interaction Transcript

    ${input.decoyResult ? 
        `**Decoy Message Deployed**: "${input.decoyResult.decoyMessage}"`
        : 'No AI decoy was deployed in this investigation.'
    }

    ---

    ## Metadata
    
    - **Export Timestamp**: ${new Date().toISOString()}
    - **Agent IDs Used**: dossier-generator-v1, osint-bloodhound-v2, behavioral-spectre-v1
    `;

    const { output } = await ai.generate({
      prompt: `Please format the following dossier content perfectly as a single Markdown block. Do not add any conversational text before or after the markdown. Content:\n\n${prompt}`,
      model: 'googleai/gemini-2.0-flash',
      output: { schema: DossierOutputSchema },
    });
    
    return output!;
  }
);

export async function generateDossier(input: DossierInput): Promise<DossierOutput> {
  return generateDossierFlow(input);
}
