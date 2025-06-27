
import { z } from 'zod';
import { OsintOutputSchema } from './osint-schemas';
import { InfidelityAnalysisOutputSchema } from './infidelity-analysis-schemas';
import { DecoyOutputSchema } from './decoy-schemas';

export const DossierInputSchema = z.object({
  targetName: z.string().describe('The name of the target for the dossier.'),
  osintReport: OsintOutputSchema.optional().describe('The full OSINT report.'),
  analysisResult: InfidelityAnalysisOutputSchema.optional().describe('The full behavioral analysis report.'),
  decoyResult: DecoyOutputSchema.optional().describe('The result of the AI decoy interaction.'),
  redacted: z.boolean().default(false).describe('Whether to redact personal information.'),
});
export type DossierInput = z.infer<typeof DossierInputSchema>;

export const DossierOutputSchema = z.object({
  markdownContent: z.string().describe('The full dossier formatted as Markdown content.'),
  fileName: z.string().describe('A suggested filename for the export (e.g., dossier-jane-doe.pdf).'),
});
export type DossierOutput = z.infer<typeof DossierOutputSchema>;
