
'use server';
/**
 * @fileOverview Agent Kernel for VIN Diesel.
 * Validates VINs with speed and swagger by connecting to the live NHTSA API.
 */

import { ai } from '@/ai/genkit'; 
import { 
    VinDieselInputSchema, 
    VinDieselOutputSchema, 
    type VinDieselInput, 
    type VinDieselOutput 
} from './vin-diesel-schemas';
import { z } from 'zod';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';
import { getCachedValidation, setCachedValidation } from './vin-diesel-cache';

const vinDieselValidationFlow = ai.defineFlow(
  {
    name: 'vinDieselValidationFlow',
    inputSchema: VinDieselInputSchema,
    outputSchema: VinDieselOutputSchema,
  },
  async ({ vin, workspaceId }) => {
    // This action involves an external API call and an LLM call.
    // Bill for both upfront to simplify the logic.
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'EXTERNAL_API' });
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });

    // --- CACHING LOGIC ---
    const cachedResult = await getCachedValidation(vin);
    if (cachedResult) {
        return cachedResult;
    }
    // --- END CACHING LOGIC ---
    
    // --- NHTSA API Integration ---
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;
    let apiData;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`NHTSA API request failed with status ${response.status}`);
        }
        apiData = await response.json();

        // The NHTSA API returns a 200 even for bad VINs, with an error message in the results.
        if (apiData.Results.some((r: any) => r.Variable === 'Error Text')) {
            const errorText = apiData.Results.find((r: any) => r.Variable === 'Error Text')?.Value;
            throw new Error(errorText || "Invalid VIN according to NHTSA.");
        }

    } catch (error) {
        console.error(`[VIN Diesel Agent] NHTSA API Error for VIN ${vin}:`, error);
        const errorResult = {
            vin,
            isValid: false,
            statusMessage: "That VIN's a ghost. Came up with nothing but static. Check your numbers.",
            decodedInfo: {},
            complianceReport: { registration: 'Unknown', customs: 'Unknown', inspection: 'Unknown' }
        };
        await setCachedValidation(vin, errorResult); // Cache failures too to prevent repeated failed requests
        return errorResult;
    }

    const results = apiData.Results;
    const findValue = (variable: string) => results.find((r: any) => r.Variable === variable)?.Value || null;

    const make = findValue('Make');
    const model = findValue('Model');
    const yearStr = findValue('Model Year');

    if (!make || !model || !yearStr) {
        const invalidDataResult = {
            vin,
            isValid: false,
            statusMessage: "This ride's papers are forged. The VIN came up empty.",
            decodedInfo: {},
            complianceReport: { registration: 'Flagged', customs: 'Flagged', inspection: 'Failed - Incomplete Data' }
        };
        await setCachedValidation(vin, invalidDataResult);
        return invalidDataResult;
    }

    const decodedInfo = {
        make,
        model,
        year: parseInt(yearStr, 10),
    };

    // --- Persona Generation ---
    const generationSchema = z.object({
        statusMessage: z.string().describe("A witty, in-character status message confirming the successful validation."),
        complianceReport: z.object({
            registration: z.string(),
            customs: z.string(),
            inspection: z.string(),
        }),
    });

    const { output } = await ai.generate({
        prompt: `You are VIN Diesel, the agentic compliance expert. Your job is to analyze a validated VIN and present the findings with swagger and confidence.
    
        const decoded vehicle information is:
        - Make: ${decodedInfo.make}
        - Model: ${decodedInfo.model}
        - Year: ${decodedInfo.year}

        Based on this, generate:
        1.  A witty, in-character 'statusMessage' confirming the successful validation. Example: "This one's clean. A '70 Dodge Charger. You're good to ride."
        2.  A mock 'complianceReport' with plausible 'registration', 'customs', and 'inspection' statuses.
        `,
        output: { schema: generationSchema },
        model: 'googleai/gemini-1.5-flash-latest'
    });

    if (!output) {
        throw new Error("VIN Diesel's comms are down. Couldn't generate response.");
    }
    
    const finalResult = {
      vin,
      isValid: true,
      decodedInfo,
      ...output
    };
    
    await setCachedValidation(vin, finalResult);
    return finalResult;
  }
);

export async function validateVin(input: VinDieselInput): Promise<VinDieselOutput> {
  return vinDieselValidationFlow(input);
}
