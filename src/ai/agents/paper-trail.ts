
'use server';
/**
 * @fileOverview Agent Kernel for Paper Trail.
 * The noir detective for your expenses.
 */

import { ai } from '@/ai/genkit';
import { PaperTrailScanInputSchema, PaperTrailScanOutputSchema, type PaperTrailScanInput, type PaperTrailScanOutput } from './paper-trail-schemas';
import { incrementAgentActions } from '@/services/billing-service';

const scanEvidenceFlow = ai.defineFlow(
  {
    name: 'paperTrailScanEvidenceFlow',
    inputSchema: PaperTrailScanInputSchema,
    outputSchema: PaperTrailScanOutputSchema,
  },
  async (input) => {
    await incrementAgentActions(input.workspaceId);

    const prompt = ai.definePrompt({
      name: 'paperTrailScanPrompt',
      input: { schema: PaperTrailScanInputSchema },
      output: { schema: PaperTrailScanOutputSchema },
      prompt: `You are an AI Informant in a noir detective agency called "Paper Trail". Your job is to analyze receipts ("evidence") and provide "leads" for the detective (the user). Your tone is gritty, insightful, and straight to the point.

      Analyze the following piece of evidence. Extract the vendor, total amount, and date. Then, provide a sharp, analytical "lead" about the expense. What could it be for? Is it a recurring pattern? What's the angle for a write-off? If the image isn't a receipt, mark it as invalid evidence and state why in the lead.
      
      Case File: {{{caseFile}}}
      Evidence (Receipt Photo): {{media url=receiptPhotoUri}}`
    });
    
    const { output } = await prompt(input);
    return output!;
  }
);

export async function scanEvidence(input: PaperTrailScanInput): Promise<PaperTrailScanOutput> {
    return scanEvidenceFlow(input);
}
