
'use server';
/**
 * @fileOverview Agent Kernel for VIN Diesel.
 * Validates VINs with speed and swagger.
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

const vinDieselValidationFlow = ai.defineFlow(
  {
    name: 'vinDieselValidationFlow',
    inputSchema: VinDieselInputSchema,
    outputSchema: VinDieselOutputSchema,
  },
  async ({ vin, workspaceId }) => {
    // This is a billable agent action.
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'EXTERNAL_API' });

    // In a real app, this would call an external VIN decoding API.
    // For now, we mock the logic with specific test cases.
    if (vin === 'TESTVIN1234567890') {
      return {
        vin,
        isValid: true,
        statusMessage: "This one's clean. Looks like you're good to ride.",
        decodedInfo: {
          make: 'Dodge',
          model: 'Charger R/T',
          year: 1970,
        },
        complianceReport: {
            registration: 'Current',
            customs: 'Cleared',
            inspection: 'Passed',
        }
      };
    }
    if (vin === 'BADVIN1234567890') {
      return {
        vin,
        isValid: false,
        statusMessage: "Whoa, that VIN looks like it took a detour through Siberia. Let's not.",
        decodedInfo: {},
        complianceReport: {
            registration: 'Flagged',
            customs: 'Flagged',
            inspection: 'Failed',
        }
      };
    }
    if (vin.length !== 17) {
        return {
            vin,
            isValid: false,
            statusMessage: "Family is everything, and so are 17 characters in a VIN. Try again.",
            decodedInfo: {},
        }
    }

    // A generic "valid" response for other inputs
    const { output } = await ai.generate({
        prompt: `You are VIN Diesel, the agentic compliance expert. You live your life a quarter mile at a time. Your job is to validate this VIN: ${vin}. It seems valid but you can't decode it. Give me a witty, confident confirmation message.`,
        output: {
            schema: z.object({
                message: z.string(),
            })
        },
        model: 'googleai/gemini-1.5-flash-latest'
    });
    
    return {
      vin,
      isValid: true,
      statusMessage: output?.message || "Looks good on paper. Let's roll.",
      decodedInfo: {
        make: 'Unknown',
        model: 'Unknown',
        year: 2024
      },
      complianceReport: {
        registration: 'Pending',
        customs: 'Pending',
        inspection: 'Required',
      }
    };
  }
);

export async function validateVin(input: VinDieselInput): Promise<VinDieselOutput> {
  return vinDieselValidationFlow(input);
}
