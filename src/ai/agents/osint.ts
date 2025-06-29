
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
    checkBurnerPhoneNumber,
    searchIntelX,
} from '../tools/osint-tools';
import { runFirecrawlerScan } from '../tools/firecrawler-tools';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

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
  async ({ targetName, context, workspaceId }) => {
    // This flow uses external tools and an LLM for synthesis. It counts as one complex action.
    await authorizeAndDebitAgentActions(workspaceId);

    const contextData = extractContextData(context || '');
    let toolResults: any = {};
    
    const promises = [];

    if (contextData.email) {
        promises.push(checkEmailBreaches({ email: contextData.email }).then(r => toolResults.breaches = r));
        promises.push(searchIntelX({ searchTerm: contextData.email }).then(r => toolResults.intelXLeaks = r));
    }
    if (contextData.phone) {
        promises.push(checkBurnerPhoneNumber({ phoneNumber: contextData.phone }).then(r => toolResults.burnerPhoneCheck = r));
    }
    if (contextData.socialUrls.length > 0) {
        // Use Firecrawler to scrape the provided social URLs
        const firecrawlerPromises = contextData.socialUrls.map(url => runFirecrawlerScan({ url }));
        promises.push(Promise.all(firecrawlerPromises).then(r => toolResults.firecrawlerReports = r));
    }
    
    await Promise.all(promises);
    
    // Now, synthesize the results with an LLM call.
    const prompt = `You are an OSINT (Open-Source Intelligence) analysis agent. Your callsign is "Bloodhound". You synthesize raw data from various sources into a coherent intelligence report. Your tone is factual, analytical, and direct.

    You have been provided with raw data findings for a target from multiple OSINT tools. This includes data breaches, IntelX leaks, burner phone checks, and raw scrapes from social media URLs using Firecrawler. Your task is to review this raw data and populate all fields of the OsintOutputSchema correctly and professionally.
    You must create a high-level summary and identify key risk factors based on the combined data. Pay special attention to the 'firecrawlerReports' to extract profile information like bios, usernames, and recent activity, then populate the 'socialProfiles' array in the final output. The content from Firecrawler is markdown.

    Target Name: ${targetName}
    User-provided context: ${context || 'None'}
    
    Raw Intelligence Data:
    """
    ${JSON.stringify(toolResults, null, 2)}
    """

    Synthesize this raw data into the final intelligence report. Ensure the summary is concise and the risk factors are clearly stated. Determine the overall digital visibility. For socialProfiles, extract follower counts if available, otherwise default to 0.
    `;

    const { output } = await ai.generate({
        prompt: prompt,
        output: { schema: OsintOutputSchema },
        model: 'googleai/gemini-1.5-flash-latest',
    });
    
    // The LLM does the synthesis, we just pass the raw data it might have missed.
    const synthesizedOutput = output!;
    synthesizedOutput.breaches = toolResults.breaches || [];
    synthesizedOutput.intelXLeaks = toolResults.intelXLeaks || [];
    synthesizedOutput.burnerPhoneCheck = toolResults.burnerPhoneCheck;

    return synthesizedOutput;
  }
);

export async function performOsintScan(input: OsintInput): Promise<OsintOutput> {
  return performOsintScanFlow(input);
}
