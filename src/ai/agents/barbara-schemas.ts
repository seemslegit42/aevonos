
'use server';
import { z } from 'zod';

export const BarbaraTaskSchema = z.enum([
    'validate_vin_label',
    'draft_customs_email',
    'check_cmvss_compliance',
    'file_insurance_update'
]).describe('The specific administrative or compliance task Barbara should perform.');

export const BarbaraInputSchema = z.object({
  documentText: z.string().describe('The raw, messy, or incomplete text of a document requiring review or processing.'),
  task: BarbaraTaskSchema,
  workspaceId: z.string().describe('The ID of the workspace performing the action.'),
});
export type BarbaraInput = z.infer<typeof BarbaraInputSchema>;

export const BarbaraOutputSchema = z.object({
  correctedText: z.string().optional().describe('The corrected, formatted, or generated text of the document or memo.'),
  complianceIssues: z.array(z.string()).describe('A list of compliance issues or errors Barbara has identified.'),
  judgmentalRemark: z.string().describe("Barbara's signature passive-aggressive, clairvoyant, and slightly condescending comment on the task."),
  isApproved: z.boolean().describe('Whether the document is now compliant and approved by Barbara.'),
});
export type BarbaraOutput = z.infer<typeof BarbaraOutputSchema>;
