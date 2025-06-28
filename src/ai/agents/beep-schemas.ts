
import { z } from 'zod';
import { DrSyntaxOutputSchema } from './dr-syntax-schemas';
import { AegisAnomalyScanOutputSchema } from './aegis-schemas';
import { ContactSchema, DeleteContactOutputSchema } from '@/ai/tools/crm-schemas';
import { BillingUsageSchema } from '@/ai/tools/billing-schemas';
import { DatingProfileSchema } from '@/ai/tools/dating-schemas';
import { VinDieselOutputSchema } from './vin-diesel-schemas';
import { VandelayAlibiOutputSchema } from './vandelay-schemas';
import { WinstonWolfeOutputSchema } from './winston-wolfe-schemas';
import { KifKrokerAnalysisOutputSchema } from './kif-kroker-schemas';
import { JrocOutputSchema } from './jroc-schemas';
import { LaheyAnalysisOutputSchema } from './lahey-schemas';
import { ForemanatorLogOutputSchema } from './foremanator-schemas';
import { SterileishAnalysisOutputSchema } from './sterileish-schemas';
import { PaperTrailScanOutputSchema } from './paper-trail-schemas';
import { BarbaraOutputSchema } from './barbara-schemas';
import { AuditorOutputSchema } from './auditor-generalissimo-schemas';
import { WingmanOutputSchema } from './wingman-schemas';
import { OsintOutputSchema } from './osint-schemas';
import { InfidelityAnalysisOutputSchema } from './infidelity-analysis-schemas';
import { DecoyOutputSchema } from './decoy-schemas';
import { DossierOutputSchema } from './dossier-schemas';
import { KendraOutputSchema } from './kendra-schemas';
import { StonksBotOutputSchema } from './stonks-bot-schemas';


// Schemas from the original BEEP agent, preserved for the public contract.
const LaunchableAppTypeSchema = z.enum([
  'file-explorer',
  'terminal',
  'echo-recall',
  'pam-poovey-onboarding',
  'infidelity-radar',
  'vin-diesel',
  'project-lumbergh',
  'lucille-bluth',
  'rolodex',
  'winston-wolfe',
  'kif-kroker',
  'vandelay',
  'paper-trail',
  'orphean-oracle',
  'jroc-business-kit',
  'lahey-surveillance',
  'the-foremanator',
  'sterileish',
  'beep-wingman',
  'aegis-threatscope',
  'dr-syntax',
  'aegis-command',
  'usage-monitor',
  'kendra',
  'stonks-bot',
  'auditor-generalissimo',
  'contact-list',
  'barbara',
]);

export const AppToLaunchSchema = z.object({
  type: LaunchableAppTypeSchema,
  title: z.string().optional().describe('A specific title for this app instance, if applicable. Otherwise, the default will be used.'),
  description: z.string().optional().describe('A specific description for this app instance, if applicable. Otherwise, the default will be used.'),
});

const CrmCreationReportSchema = z.object({
    action: z.literal('create'),
    report: ContactSchema.describe('The details of the newly created contact.'),
});

const CrmUpdateReportSchema = z.object({
    action: z.literal('update'),
    report: ContactSchema.describe('The details of the updated contact.'),
});

const CrmListReportSchema = z.object({
    action: z.literal('list'),
    report: z.array(ContactSchema).describe('A list of contacts.'),
});

const CrmDeletionReportSchema = z.object({
    action: z.literal('delete'),
    report: DeleteContactOutputSchema.describe('The result of the deletion operation.'),
});

const CrmAgentReportSchema = z.discriminatedUnion('action', [
    CrmCreationReportSchema,
    CrmUpdateReportSchema,
    CrmListReportSchema,
    CrmDeletionReportSchema,
]);

const BillingAgentReportSchema = z.object({
    action: z.literal('get_usage'),
    report: BillingUsageSchema.describe('The billing usage details.'),
});

const DatingAgentReportSchema = z.object({
    action: z.literal('get_profile'),
    report: DatingProfileSchema.describe('The fetched dating profile details.'),
});


export const AgentReportSchema = z.discriminatedUnion('agent', [
  z.object({
    agent: z.literal('dr-syntax'),
    report: DrSyntaxOutputSchema.describe(
      'The full report object from the Dr. Syntax agent.'
    ),
  }),
  z.object({
    agent: z.literal('aegis'),
    report: AegisAnomalyScanOutputSchema.describe(
      'The full report object from the Aegis agent.'
    ),
  }),
   z.object({
    agent: z.literal('crm'),
    report: CrmAgentReportSchema,
  }),
  z.object({
    agent: z.literal('billing'),
    report: BillingAgentReportSchema,
  }),
  z.object({
    agent: z.literal('dating'),
    report: DatingAgentReportSchema,
  }),
  z.object({
    agent: z.literal('vin-diesel'),
    report: VinDieselOutputSchema.describe(
        'The full report from the VIN Diesel agent.'
    ),
  }),
  z.object({
    agent: z.literal('winston-wolfe'),
    report: WinstonWolfeOutputSchema.describe('The full report from The Winston Wolfe agent.'),
  }),
  z.object({
    agent: z.literal('kif-kroker'),
    report: KifKrokerAnalysisOutputSchema.describe('The full report from The Kif Kroker agent.'),
  }),
  z.object({
    agent: z.literal('vandelay'),
    report: VandelayAlibiOutputSchema.describe('The full report from the Vandelay Industries agent.'),
  }),
  z.object({
    agent: z.literal('jroc'),
    report: JrocOutputSchema.describe('The full report from the J-ROC agent.'),
  }),
  z.object({
    agent: z.literal('lahey'),
    report: LaheyAnalysisOutputSchema.describe('The full report from the Lahey Surveillance agent.'),
  }),
  z.object({
    agent: z.literal('foremanator'),
    report: ForemanatorLogOutputSchema.describe('The full report from The Foremanator agent.'),
  }),
  z.object({
    agent: z.literal('sterileish'),
    report: SterileishAnalysisOutputSchema.describe('The full report from the STERILE-ish agent.'),
  }),
  z.object({
    agent: z.literal('paper-trail'),
    report: PaperTrailScanOutputSchema.describe('The full report from the Paper Trail agent.'),
  }),
  z.object({
    agent: z.literal('barbara'),
    report: BarbaraOutputSchema.describe('The full report from Agent Barbara.'),
  }),
  z.object({
    agent: z.literal('auditor'),
    report: AuditorOutputSchema.describe('The full report from The Auditor Generalissimo agent.'),
  }),
  z.object({
    agent: z.literal('wingman'),
    report: WingmanOutputSchema.describe(
        'The full report from the BEEP Wingman agent.'
    ),
  }),
  z.object({
    agent: z.literal('osint'),
    report: OsintOutputSchema.describe('The full report from the OSINT agent.'),
  }),
  z.object({
    agent: z.literal('infidelity-analysis'),
    report: InfidelityAnalysisOutputSchema.describe('The full report from the behavioral analysis agent.'),
  }),
  z.object({
    agent: z.literal('decoy'),
    report: DecoyOutputSchema.describe('The full report from the AI decoy agent.'),
  }),
  z.object({
    agent: z.literal('dossier'),
    report: DossierOutputSchema.describe('The full report from the dossier generation agent.'),
  }),
  z.object({
    agent: z.literal('legal-dossier'),
    report: DossierOutputSchema.describe('The full report from the legal dossier generation agent.'),
  }),
  z.object({
    agent: z.literal('kendra'),
    report: KendraOutputSchema.describe('The full report from the KENDRA.exe agent.'),
  }),
  z.object({
    agent: z.literal('stonks'),
    report: StonksBotOutputSchema.describe('The full report from the Stonks Bot agent.'),
  }),
]);

export const UserCommandInputSchema = z.object({
  userCommand: z.string().describe('A natural language command from the user about what they want to do or launch.'),
  userId: z.string(),
  workspaceId: z.string(),
});
export type UserCommandInput = z.infer<typeof UserCommandInputSchema>;

export const UserCommandOutputSchema = z.object({
  appsToLaunch: z.array(AppToLaunchSchema).describe('An array of Micro-Apps that BEEP has determined should be launched on the Canvas based on the user command. This can be empty.'),
  agentReports: z.array(AgentReportSchema).optional().describe("An array of reports generated by other agents after BEEP delegated tasks to them. This should be populated with the result of any tool calls."),
  suggestedCommands: z.array(z.string()).describe('If no specific app can be launched or action taken, provide an array of suggested commands or actions the user could take next. This is for conversational repair.'),
  responseText: z.string().describe('A natural language response to the user confirming the action or asking for clarification.'),
});
export type UserCommandOutput = z.infer<typeof UserCommandOutputSchema>;
