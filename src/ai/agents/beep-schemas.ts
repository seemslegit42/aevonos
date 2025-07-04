

import { z } from 'zod';
import { SecurityRiskLevel, UserPsyche, UserRole } from '@prisma/client';
import { DrSyntaxOutputSchema, DrSyntaxInputSchema } from './dr-syntax-schemas';
import { AegisAnomalyScanOutputSchema, PulseProfileSchema } from './aegis-schemas';
import { ContactSchema, DeleteContactOutputSchema } from '@/ai/tools/crm-schemas';
import { BillingUsageSchema, RequestCreditTopUpOutputSchema } from '@/ai/tools/billing-schemas';
import { DatingProfileSchema } from '@/ai/tools/dating-schemas';
import { VinDieselInputSchema, VinDieselOutputSchema } from './vin-diesel-schemas';
import { VandelayAlibiOutputSchema, VandelayAlibiInputSchema } from './vandelay-schemas';
import { WinstonWolfeOutputSchema, WinstonWolfeInputSchema } from './winston-wolfe-schemas';
import { KifKrokerAnalysisOutputSchema, KifKrokerAnalysisInputSchema } from './kif-kroker-schemas';
import { RolodexAnalysisOutputSchema, RolodexAnalysisInputSchema } from './rolodex-schemas';
import { JrocOutputSchema, JrocInputSchema } from './jroc-schemas';
import { LaheyAnalysisOutputSchema, LaheyAnalysisInputSchema } from './lahey-schemas';
import { ForemanatorLogOutputSchema, ForemanatorLogInputSchema } from './foremanator-schemas';
import { SterileishAnalysisOutputSchema, SterileishAnalysisInputSchema } from './sterileish-schemas';
import { PaperTrailScanOutputSchema, PaperTrailScanInputSchema } from './paper-trail-schemas';
import { BarbaraOutputSchema, BarbaraInputSchema } from './barbara-schemas';
import { AuditorOutputSchema, AuditorInputSchema } from './auditor-generalissimo-schemas';
import { WingmanOutputSchema, WingmanInputSchema } from './wingman-schemas';
import { OsintOutputSchema } from './osint-schemas';
import { InfidelityAnalysisOutputSchema } from './infidelity-analysis-schemas';
import { DecoyOutputSchema } from './decoy-schemas';
import { DossierOutputSchema } from './dossier-schemas';
import { KendraOutputSchema, KendraInputSchema } from './kendra-schemas';
import { OrpheanOracleOutputSchema, OrpheanOracleInputSchema } from './orphean-oracle-schemas';
import { LumberghAnalysisOutputSchema, LumberghAnalysisInputSchema } from './lumbergh-schemas';
import { LucilleBluthOutputSchema, LucilleBluthInputSchema } from './lucille-bluth-schemas';
import { PamAudioOutputSchema, PamScriptInputSchema } from './pam-poovey-schemas';
import { TransactionSchema } from '@/ai/tools/ledger-schemas';
import { StonksBotOutputSchema, StonksBotInputSchema } from './stonks-bot-schemas';
import { RenoModeAnalysisOutputSchema, RenoModeAnalysisInputSchema } from './reno-mode-schemas';
import { PatricktAgentOutputSchema, PatricktAgentInputSchema } from './patrickt-agent-schemas';
import { InventoryDaemonOutputSchema } from './inventory-daemon-schemas';
import { SystemStatusSchema, FindUsersByVowOutputSchema, ManageSyndicateOutputSchema } from '@/ai/tools/demiurge-schemas';
import { DemiurgeActionSchema, DemiurgeAgentReportPayloadSchema } from './demiurge-agent-schemas';
import { RitualQuestOutputSchema, RitualQuestInputSchema } from './ritual-quests-schemas';
import { TransmuteCreditsOutputSchema } from '@/ai/tools/proxy-schemas';
import { VaultAnalysisOutputSchema } from './vault-daemon-schemas';
import { CrmActionSchema } from './crm-agent-schemas';


// Schemas from the original BEEP agent, preserved for the public contract.
const LaunchableAppTypeSchema = z.enum([
  'file-explorer',
  'terminal',
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
  'foremanator',
  'sterileish',
  'beep-wingman',
  'aegis-threatscope',
  'dr-syntax',
  'aegis-command',
  'usage-monitor',
  'kendra',
  'auditor-generalissimo',
  'contact-list',
  'barbara',
  'oracle-of-delphi-valley',
  'armory',
  'stonks-bot',
  'user-profile-settings',
  'workspace-settings',
  'top-up',
  'admin-console',
  'validator',
  'reno-mode',
  'patrickt-app',
  'howards-sidekick',
  'sisyphus-ascent',
  'merchant-of-cabbage',
  'command-and-cauldron',
  'integration-nexus',
  'ritual-quests',
  'proxy-agent',
]);

export const AppToLaunchSchema = z.object({
  type: LaunchableAppTypeSchema,
  title: z.string().optional().describe('A specific title for this app instance, if applicable. Otherwise, the default will be used.'),
  description: z.string().optional().describe('A specific description for this app instance, if applicable. Otherwise, the default will be used.'),
  contentProps: z.record(z.any()).optional().describe('Props to pass to the Micro-App component.'),
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

const BillingTopUpReportSchema = z.object({
    action: z.literal('request_top_up'),
    report: RequestCreditTopUpOutputSchema.describe('The result of the credit top-up request.'),
});

const BillingAgentReportSchema = z.discriminatedUnion('action', [
    z.object({
        action: z.literal('get_usage'),
        report: BillingUsageSchema.describe('The billing usage details.'),
    }),
    BillingTopUpReportSchema,
]);

const DatingAgentReportSchema = z.object({
    action: z.literal('get_profile'),
    report: DatingProfileSchema.describe('The fetched dating profile details.'),
});

const SecurityAgentReportSchema = z.object({
    action: z.literal('create_alert'),
    report: z.object({
        alertId: z.string(),
        type: z.string(),
        riskLevel: z.nativeEnum(SecurityRiskLevel),
    }).describe('Details of the created security alert.'),
});

const LedgerAgentReportSchema = z.object({
    action: z.literal('create_manual_transaction'),
    report: TransactionSchema.describe('The details of the manually created transaction.'),
});

const ProxyAgentReportSchema = z.object({
    action: z.literal('transmute'),
    report: TransmuteCreditsOutputSchema.describe('The result of the transmutation.'),
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
    agent: z.literal('security'),
    report: SecurityAgentReportSchema,
  }),
  z.object({
    agent: z.literal('ledger'),
    report: LedgerAgentReportSchema,
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
    agent: z.literal('rolodex'),
    report: RolodexAnalysisOutputSchema.describe('The full report from The Rolodex agent.'),
  }),
  z.object({
    agent: z.literal('jroc'),
    report: JrocOutputSchema.describe('The full report from the J-ROC agent.'),
  }),
  z.object({
    agent: z.literal('lahey_surveillance'),
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
    agent: z.literal('orphean-oracle'),
    report: OrpheanOracleOutputSchema.describe('The full report from the Orphean Oracle agent.'),
  }),
  z.object({
    agent: z.literal('lumbergh'),
    report: LumberghAnalysisOutputSchema.describe('The full report from the Project Lumbergh agent.'),
  }),
  z.object({
    agent: z.literal('lucille-bluth'),
    report: LucilleBluthOutputSchema.describe('The full report from The Lucille Bluth agent.'),
  }),
  z.object({
    agent: z.literal('pam-poovey'),
    report: PamAudioOutputSchema.describe('The full report from the Pam Poovey agent.'),
  }),
  z.object({
    agent: z.literal('stonks'),
    report: StonksBotOutputSchema.describe('The full report from the Stonks Bot.'),
  }),
  z.object({
    agent: z.literal('reno-mode'),
    report: RenoModeAnalysisOutputSchema.describe('The report from the Reno Mode™ agent.'),
  }),
  z.object({
    agent: z.literal('patrickt-app'),
    report: PatricktAgentOutputSchema.describe('The report from the Patrickt™ agent.'),
  }),
  z.object({
    agent: z.literal('inventory-daemon'),
    report: InventoryDaemonOutputSchema.describe('The report from the Inventory Daemon.'),
  }),
  z.object({
    agent: z.literal('demiurge'),
    report: DemiurgeAgentReportPayloadSchema,
  }),
  z.object({
      agent: z.literal('ritual-quests'),
      report: RitualQuestOutputSchema,
  }),
  z.object({
    agent: z.literal('proxy'),
    report: ProxyAgentReportSchema,
  }),
  z.object({
    agent: z.literal('vault'),
    report: VaultAnalysisOutputSchema.describe('The full report from the Vault Daemon.'),
  })
]);

const RouteActionSchema = z.discriminatedUnion("route", [
    z.object({ route: z.literal("reasoner") }),
    z.object({ route: z.literal("inventory_daemon"), params: z.object({ query: z.string() }) }),
    z.object({ route: z.literal("burn_bridge_protocol") }),
    z.object({ route: z.literal("vault_daemon") }),
    z.object({ 
      route: z.literal("crm_agent"), 
      params: CrmActionSchema.describe("The specific CRM action and parameters extracted from the user's command.") 
    }),
    z.object({ 
      route: z.literal("dr_syntax"), 
      params: DrSyntaxInputSchema.pick({ content: true, contentType: true }).describe("The content and its type to be critiqued.")
    }),
    z.object({ 
      route: z.literal("stonks_bot"), 
      params: StonksBotInputSchema.pick({ ticker: true, mode: true }).describe("The stock ticker and personality mode for the bot.")
    }),
    z.object({
        route: z.literal('winston_wolfe'),
        params: WinstonWolfeInputSchema.pick({ reviewText: true }),
    }),
    z.object({
        route: z.literal('kif_kroker'),
        params: KifKrokerAnalysisInputSchema.pick({ channelId: true }),
    }),
    z.object({
        route: z.literal('vandelay'),
        params: VandelayAlibiInputSchema.pick({ topicHint: true, addAttendees: true }).partial(),
    }),
    z.object({
        route: z.literal('rolodex'),
        params: RolodexAnalysisInputSchema.pick({ candidateName: true, candidateSummary: true, jobDescription: true }),
    }),
    z.object({
        route: z.literal('jroc'),
        params: JrocInputSchema.pick({ businessType: true, logoStyle: true }),
    }),
    z.object({
        route: z.literal('lahey_surveillance'),
        params: LaheyAnalysisInputSchema.pick({ logEntry: true }),
    }),
    z.object({
        route: z.literal('foremanator'),
        params: ForemanatorLogInputSchema.pick({ logText: true }),
    }),
    z.object({
        route: z.literal('sterileish'),
        params: SterileishAnalysisInputSchema.pick({ logText: true, entryType: true }),
    }),
    z.object({
        route: z.literal('paper_trail'),
        params: PaperTrailScanInputSchema.pick({ receiptPhotoUri: true, caseFile: true }).partial(),
    }),
    z.object({
        route: z.literal('barbara'),
        params: BarbaraInputSchema.pick({ documentText: true, task: true }),
    }),
    z.object({
        route: z.literal('auditor'),
        params: AuditorInputSchema.pick({ transactions: true }),
    }),
    z.object({
        route: z.literal('wingman'),
        params: WingmanInputSchema.pick({ situationContext: true, messageMode: true }),
    }),
    z.object({
        route: z.literal('kendra'),
        params: KendraInputSchema.pick({ productIdea: true }),
    }),
    z.object({
        route: z.literal('orphean_oracle'),
        params: OrpheanOracleInputSchema.pick({ userQuery: true }),
    }),
    z.object({
        route: z.literal('lumbergh'),
        params: LumberghAnalysisInputSchema.pick({ inviteText: true }),
    }),
    z.object({
        route: z.literal('lucille_bluth'),
        params: LucilleBluthInputSchema.pick({ expenseDescription: true, expenseAmount: true, category: true }),
    }),
    z.object({
        route: z.literal('pam_poovey'),
        params: PamScriptInputSchema.pick({ topic: true }),
    }),
    z.object({
        route: z.literal('reno_mode'),
        params: RenoModeAnalysisInputSchema.pick({ photoDataUri: true }),
    }),
    z.object({
        route: z.literal('patrickt_app'),
        params: PatricktAgentInputSchema.pick({ action: true, eventDescription: true, eventCategory: true, chatInput: true }).partial(),
    }),
    z.object({
        route: z.literal('vin_diesel'),
        params: VinDieselInputSchema.pick({ vin: true }),
    }),
    z.object({
        route: z.literal('ritual_quests'),
        params: RitualQuestInputSchema.pick({}).partial(),
    }),
    z.object({ 
      route: z.literal("demiurge"), 
      params: DemiurgeActionSchema.describe("The specific administrative action and parameters.") 
    }),
]).describe("A single task to be executed by a specialist agent.");

export const RouterSchema = z.array(RouteActionSchema)
  .describe("An array of all agentic tasks that need to be performed to fulfill the user's command. This array can be empty if the command is a simple query or app launch that the main Reasoner should handle.");
export type RouterResult = z.infer<typeof RouterSchema>;


export const UserCommandInputSchema = z.object({
  userCommand: z.string().describe('A natural language command from the user about what they want to do or launch.'),
  userId: z.string(),
  workspaceId: z.string(),
  psyche: z.nativeEnum(UserPsyche),
  role: z.nativeEnum(UserRole),
  activeAppContext: z.string().optional().describe('The type of the currently active Micro-App, for contextual persona shifting.'),
  pulseProfile: PulseProfileSchema.optional().describe("The user's current psychological state from their Pulse Profile."),
});
export type UserCommandInput = z.infer<typeof UserCommandInputSchema>;

export const UserCommandOutputSchema = z.object({
  appsToLaunch: z.array(AppToLaunchSchema).describe('An array of Micro-Apps that BEEP has determined should be launched on the Canvas based on the user command. This can be empty.'),
  agentReports: z.array(AgentReportSchema).optional().describe("An array of reports generated by other agents after BEEP delegated tasks to them. This should be populated with the result of any tool calls."),
  suggestedCommands: z.array(z.string()).describe('If no specific app can be launched or action taken, provide an array of suggested commands or actions the user could take next. This is for conversational repair.'),
  responseText: z.string().describe('A natural language response to the user confirming the action or asking for clarification.'),
  responseAudioUri: z.string().optional().describe('A data URI for the TTS audio of the responseText.'),
});
export type UserCommandOutput = z.infer<typeof UserCommandOutputSchema>;
    

    
