
import { z } from 'zod';

export const PaperTrailScanInputSchema = z.object({
  receiptPhotoUri: z.string().describe("A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  caseFile: z.string().optional().describe("The name of the case file this evidence belongs to."),
});
export type PaperTrailScanInput = z.infer<typeof PaperTrailScanInputSchema>;

export const PaperTrailScanOutputSchema = z.object({
  vendor: z.string().describe("The name of the vendor or store from the receipt."),
  amount: z.number().describe("The total amount of the transaction."),
  date: z.string().describe("The date of the transaction (YYYY-MM-DD)."),
  lead: z.string().describe("A noir-detective style 'lead' or analytical note about the expense, suggesting how to categorize it or what it implies."),
  isEvidenceValid: z.boolean().describe("Whether the image appears to be a valid receipt."),
});
export type PaperTrailScanOutput = z.infer<typeof PaperTrailScanOutputSchema>;
