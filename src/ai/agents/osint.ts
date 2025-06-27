
'use server';
/**
 * @fileOverview Agent Kernel for the OSINT Digital Bloodhound.
 * Scours open-source intelligence to build a profile on a target.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { OsintInputSchema, OsintOutputSchema, type OsintInput, type OsintOutput } from './osint-schemas';
import {
    checkEmailBreaches,
    scrapeSocialMediaProfile,
    checkBurnerPhoneNumber,
    searchIntelX,
} from '../tools/osint-tools';

// Helper function to extract potential data points from context
const extractContextData = (context: string) => {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const phoneRegex = /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/gi;
    const urlRegex = /https?:\/\/[^\s]+/gi;
    
    const emails = context.match(emailRegex);
    const phones = context.match(phoneRegex);
    const urls = context.match(urlRegex);

    return {
        email: emails ? emails[0] : null,
        phone: phones ? phones[0] : null,
        socialUrls: urls || []
    };
};


const performOsintScanFlow = ai.defineFlow(
  {
    name: 'performOsintScanFlow',
    inputSchema: OsintInputSchema,
    outputSchema: OsintOutputSchema,
  },
  async ({ targetName, context }) => {
    const contextData = extractContextData(context || '');
    let toolResults = {} as Partial<OsintOutput>;
    
    // Run tools in parallel where possible
    const promises = [];

    if (contextData.email) {
        promises.push(checkEmailBreaches({ email: contextData.email }).then(r => toolResults.breaches = r));
        promises.push(searchIntelX({ searchTerm: contextData.email }).then(r => toolResults.intelXLeaks = r));
    }
    if (contextData.phone) {
        promises.push(checkBurnerPhoneNumber({ phoneNumber: contextData.phone }).then(r => toolResults.burnerPhoneCheck = r));
    }
    if (contextData.socialUrls.length > 0) {
        const socialPromises = contextData.socialUrls.map(url => scrapeSocialMediaProfile({ profileUrl: url }));
        promises.push(Promise.all(socialPromises).then(r => toolResults.socialProfiles = r));
    }

    await Promise.all(promises);
    
    // Now, synthesize the results with an LLM call.
    const prompt = `You are an OSINT (Open-Source Intelligence) analysis agent. Your callsign is "Bloodhound". You synthesize raw data from various sources into a coherent intelligence report. Your tone is factual, analytical, and direct.

    You have been provided with raw data findings for a target from multiple OSINT tools. Your task is to review this raw data and populate all fields of the OsintOutputSchema correctly and professionally.
    You must create a high-level summary and identify key risk factors based on the combined data.

    Target Name: ${targetName}
    User-provided context: ${context || 'None'}
    
    Raw Intelligence Data:
    """
    ${JSON.stringify(toolResults, null, 2)}
    """

    Synthesize this raw data into the final intelligence report. Ensure the summary is concise and the risk factors are clearly stated. Determine the overall digital visibility.
    `;

    const { output } = await ai.generate({
        prompt: prompt,
        output: { schema: OsintOutputSchema },
        model: 'googleai/gemini-2.0-flash',
    });
    
    // Ensure tool results are included even if LLM misses them
    return {
        ...toolResults,
        ...output!,
    };
  }
);

export async function performOsintScan(input: OsintInput): Promise<OsintOutput> {
  return performOsintScanFlow(input);
}
