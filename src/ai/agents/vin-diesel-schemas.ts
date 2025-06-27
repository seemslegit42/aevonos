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
});
export type VinDieselOutput = z.infer<typeof VinDieselOutputSchema>;
