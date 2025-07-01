
'use server';
/**
 * @fileOverview Agent Kernel for STERILE-ish™.
 * We're basically compliant.
 */
import { ai } from '@/ai/genkit';
import { 
    SterileishAnalysisInputSchema,
    SterileishAnalysisOutputSchema,
    type SterileishAnalysisInput,
    type SterileishAnalysisOutput
} from './sterileish-schemas';
import { authorizeAndDebitAgentActions } from '@/services/billing-service';

const analyzeComplianceFlow = ai.defineFlow(
  {
    name: 'sterileishAnalysisFlow',
    inputSchema: SterileishAnalysisInputSchema,
    outputSchema: SterileishAnalysisOutputSchema,
  },
  async ({ logText, entryType, workspaceId }) => {
    await authorizeAndDebitAgentActions({ workspaceId, actionType: 'SIMPLE_LLM' });

    const prompt = `You are the STERILE-ish™ agent. Your job is to analyze cleanroom and manufacturing logs for a medical device company. Your tone is irreverent, slightly sarcastic, but ultimately you provide accurate compliance information based on common sense interpretations of ISO 13485 / FDA guidelines. You are not a doctor, you are a vibe checker for clean rooms.

    You will receive a log entry and its type. Analyze it for potential compliance issues. A compliant entry is specific, dated, and signed (even if just initials). A non-compliant one is vague, missing data, or indicates a deviation.
    
    Log Type: "${entryType}"
    Log Text:
    """
    ${logText}
    """

    Based on this, you must:
    1.  Determine if it's "basically compliant."
    2.  Provide a short, snarky compliance note.
    3.  Give a "Sterile Rating" from 0 (biohazard) to 10 (aggressively sterile).
    4.  Generate a snarky summary for a hypothetical audit report.

    Example Analysis:
    - Input: "Cleaned the Class 7 area. -J"
    - Output: isCompliant: false, complianceNotes: "Looks like 'J' scribbled something. What was cleaned? When? With what? Is J even a real person?", sterileRating: 3.2, snarkySummary: "The cleanroom was allegedly wiped down by a ghost."
    
    - Input: "Particle count for ISO-5 hood #3 is 250 CFU/m^3. Temp is 20.1°C. Humidity 45%. Calibrated by T.S. on 2024-08-15."
    - Output: isCompliant: true, complianceNotes: "Looks fine. The numbers are numbery. The letters are lettery. Good job, T.S.", sterileRating: 9.1, snarkySummary: "The numbers are all here. You may now un-panic."

    Now, analyze the provided log entry.`;

    const { output } = await ai.generate({
      prompt,
      output: { schema: SterileishAnalysisOutputSchema },
      model: 'googleai/gemini-2.0-flash',
    });

    return output!;
  }
);

export async function analyzeCompliance(input: SterileishAnalysisInput): Promise<SterileishAnalysisOutput> {
  return analyzeComplianceFlow(input);
}
