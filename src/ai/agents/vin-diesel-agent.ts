'use server';
/**
 * @fileOverview The VIN Diesel Daemon, a specialist agent for validating VINs.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { VinDieselInputSchema, VinDieselOutputSchema } from './vin-diesel-schemas';
import { validateVin } from './vin-diesel';

export const VinDieselAgentInputSchema = VinDieselInputSchema;
export type VinDieselAgentInput = z.infer<typeof VinDieselAgentInputSchema>;

export const VinDieselAgentOutputSchema = z.object({
    agent: z.literal('vin-diesel'),
    report: VinDieselOutputSchema,
});
export type VinDieselAgentOutput = z.infer<typeof VinDieselAgentOutputSchema>;

const consultVinDieselFlow = ai.defineFlow({
    name: 'consultVinDieselFlow',
    inputSchema: VinDieselAgentInputSchema,
    outputSchema: VinDieselAgentOutputSchema,
}, async (input) => {
    const report = await validateVin(input);
    return { agent: 'vin-diesel', report };
});

export async function consultVinDiesel(input: VinDieselAgentInput): Promise<VinDieselAgentOutput> {
  return consultVinDieselFlow(input);
}
