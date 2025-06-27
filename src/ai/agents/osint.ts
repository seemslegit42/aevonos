'use server';
/**
 * @fileOverview Agent Kernel for the OSINT Digital Bloodhound.
 * Scours open-source intelligence to build a profile on a target.
 */

import { ai } from '@/ai/genkit';
import { OsintInputSchema, OsintOutputSchema, type OsintInput, type OsintOutput } from './osint-schemas';

const performOsintScanFlow = ai.defineFlow(
  {
    name: 'performOsintScanFlow',
    inputSchema: OsintInputSchema,
    outputSchema: OsintOutputSchema,
  },
  async ({ targetName, context }) => {
    // In a real application, this would call multiple external APIs (Clearbit, social media APIs, etc.)
    // For this environment, we call our single mock OSINT integration endpoint.
    // The prompt is written as if it's synthesizing data from multiple sources.
    
    const osintData = await fetch(`http://localhost:9002/api/integrations/osint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetName })
    }).then(res => res.json());

    const prompt = `You are an OSINT (Open-Source Intelligence) analysis agent. Your callsign is "Bloodhound". You synthesize raw data from various sources into a coherent intelligence report. Your tone is factual, analytical, and direct.

    You have been provided with raw data findings for a target. Your task is to review this raw data and populate the fields of the OsintOutputSchema correctly and professionally. You do not need to invent new information; reformat and summarize the provided data into the correct schema fields.

    Target Name: ${targetName}
    User-provided context: ${context || 'None'}
    
    Raw Intelligence Data:
    """
    ${JSON.stringify(osintData, null, 2)}
    """

    Synthesize this raw data into the final intelligence report. Ensure the summary is concise and the risk factors are clearly stated.
    `;

    const { output } = await ai.generate({
        prompt: prompt,
        output: { schema: OsintOutputSchema },
        model: 'googleai/gemini-2.0-flash',
    });
    
    return output!;
  }
);

export async function performOsintScan(input: OsintInput): Promise<OsintOutput> {
  return performOsintScanFlow(input);
}
