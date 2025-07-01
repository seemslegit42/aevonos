
import { z } from 'zod';
import { OsintOutputSchema } from './osint-schemas';
import { InfidelityAnalysisOutputSchema } from './infidelity-analysis-schemas';
import { DecoyOutputSchema } from './decoy-schemas';
import { DossierOutputSchema } from './dossier-schemas';

export const BurnBridgeInputSchema = z.object({
  targetName: z.string().describe("The name of the target for the dossier."),
  osintContext: z.string().optional().describe("Additional context for OSINT, like email or social URLs."),
  situationDescription: z.string().describe("A description of the situation for behavioral analysis."),
  workspaceId: z.string(),
  userId: z.string(),
});
export type BurnBridgeInput = z.infer<typeof BurnBridgeInputSchema>;

export const BurnBridgeStateSchema = z.object({
  input: BurnBridgeInputSchema,
  osintReport: OsintOutputSchema.optional(),
  analysisResult: InfidelityAnalysisOutputSchema.optional(),
  decoyResult: DecoyOutputSchema.optional(),
  finalDossier: DossierOutputSchema.optional(),
});
export type BurnBridgeState = z.infer<typeof BurnBridgeStateSchema>;
