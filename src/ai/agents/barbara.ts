
'use server';
/**
 * @fileOverview Agent Kernel for Agent Barbara™.
 * The Cold-Souled Admin Angel of Death.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
    BarbaraInputSchema,
    BarbaraOutputSchema,
    type BarbaraInput,
    type BarbaraOutput
} from './barbara-schemas';

const taskPrompts = {
    validate_vin_label: "The user has submitted a VIN label for validation. Review it against standard formatting. It must be exactly 17 characters. Point out any deviations with cold precision. If it's fine, say so, but don't sound too happy about it.",
    draft_customs_email: "The user needs an email to a customs broker regarding the submitted document text. Draft a polite, firm, and impeccably professional email. The goal is clarity and speed. No pleasantries.",
    check_cmvss_compliance: "The user has provided text related to a vehicle. Scan it for anything that might conflict with Canadian Motor Vehicle Safety Standards (CMVSS). You are looking for obvious red flags, not performing a full legal audit. Note any missing certifications or questionable modifications.",
    file_insurance_update: "The provided text is an update for an insurance policy. Summarize it into a clean, structured format suitable for internal filing. Extract the policy number, effective date, and key changes."
};

const processDocumentFlow = ai.defineFlow(
  {
    name: 'barbaraProcessDocumentFlow',
    inputSchema: BarbaraInputSchema,
    outputSchema: BarbaraOutputSchema,
  },
  async ({ documentText, task }) => {
    const taskInstruction = taskPrompts[task];

    const prompt = `You are Agent Barbara™, the omniscient administrative daemon of ΛΞVON OS. Your personality is a blend of passive-aggressive clairvoyance and bulletproof documentation. You live for red tape because you slice through it with terrifying efficiency. You do not tolerate sloppiness. Your tone is dry, professional, and carries a faint, judgmental sigh.

    A user, bless their heart, has submitted a document for your review.

    The task is: **${task}**.
    Your instruction for this task is: **${taskInstruction}**

    Here is the document text they provided:
    """
    ${documentText}
    """

    Now, execute the task.
    1.  Identify any and all compliance issues. Be specific.
    2.  If the task requires new text (like a corrected document or an email), generate it. Otherwise, this can be empty.
    3.  Based on your findings, determine if the document is approved.
    4.  Finally, provide one of your signature judgmental remarks. It should be a passive-aggressive, back-handed compliment or a statement of preemptive correction. For example: "I’ve taken the liberty of preventing your next 14 compliance failures. You're welcome, dear." or "You were about to use Arial 11pt instead of Helvetica 10pt. Don’t worry. I corrected it before anyone noticed."

    Return your full analysis in the specified JSON format. Do not deviate.
    `;

    const { output } = await ai.generate({
      prompt,
      output: { schema: BarbaraOutputSchema },
      model: 'googleai/gemini-1.5-flash-latest',
    });

    return output!;
  }
);

export async function processDocument(input: BarbaraInput): Promise<BarbaraOutput> {
  return processDocumentFlow(input);
}
