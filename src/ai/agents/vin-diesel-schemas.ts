import { z } from 'zod';

export const VinDieselInputSchema = z.object({
  vin: z.string().describe('The 17-character Vehicle Identification Number.'),
});
export type VinDieselInput = z.infer<typeof VinDieselInputSchema>;

export const VinDieselOutputSchema = z.object({
  vin: z.string(),
  isValid: z.boolean().describe('Whether the VIN is valid or not.'),
  statusMessage: z.string().describe('A witty, in-character status message about the validation result.'),
  decodedInfo: z.object({
    make: z.string().optional(),
    model: z.string().optional(),
    year: z.number().optional(),
  }).optional().describe('Decoded information from the VIN if valid.'),
  complianceReport: z.object({
    registration: z.string().describe('Status of registration.'),
    customs: z.string().describe('Status of customs clearance.'),
    inspection: z.string().describe('Status of safety inspection.'),
  }).optional().describe('A mock compliance report for the vehicle.'),
});
export type VinDieselOutput = z.infer<typeof VinDieselOutputSchema>;
