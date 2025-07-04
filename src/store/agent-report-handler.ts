
'use client';

import type { AppStore } from './app-store';
import type { AgentReport, CrmAgentReport, BillingAgentReport } from '@/ai/agents/beep-schemas';

import type { DrSyntaxOutput } from '@/ai/agents/dr-syntax-schemas';
import type { WinstonWolfeOutput } from '@/ai/agents/winston-wolfe-schemas';
import { KifKrokerAnalysisOutput } from '@/ai/agents/kif-kroker-schemas';
import { VandelayAlibiOutput } from '@/ai/agents/vandelay-schemas';
import { RolodexAnalysisOutput } from '@/ai/agents/rolodex-schemas';
import { PaperTrailScanOutput } from '@/ai/agents/paper-trail-schemas';
import { JrocOutput } from '@/ai/agents/jroc-schemas';
import { LaheyAnalysisOutput } from '@/ai/agents/lahey-schemas';
import { ForemanatorLogOutput } from '@/ai/agents/foremanator-schemas';
import { SterileishAnalysisOutput } from '@/ai/agents/sterileish-schemas';
import { BarbaraOutput } from '@/ai/agents/barbara-schemas';
import { AuditorOutput } from '@/ai/agents/auditor-generalissimo-schemas';
import { WingmanOutput } from '@/ai/agents/wingman-schemas';
import { KendraOutput } from '@/ai/agents/kendra-schemas';
import { OrpheanOracleOutput } from '@/ai/agents/orphean-oracle-schemas';
import { LumberghAnalysisOutput } from '@/ai/agents/lumbergh-schemas';
import { LucilleBluthOutput } from '@/ai/agents/lucille-bluth-schemas';
import { PamAudioOutput } from '@/ai/agents/pam-poovey-schemas';
import { StonksBotOutput } from '@/ai/agents/stonks-bot-schemas';
import { RenoModeAnalysisOutput } from '@/ai/agents/reno-mode-schemas';
import { PatricktAgentOutput } from '@/ai/agents/patrickt-agent-schemas';
import { VinDieselOutput } from '@/ai/agents/vin-diesel-schemas';
import { InventoryDaemonOutput } from '@/ai/agents/inventory-daemon-schemas';
import { RitualQuestOutput } from '@/ai/agents/ritual-quests-schemas';
import type { OsintOutput } from '@/ai/agents/osint-schemas';
import type { InfidelityAnalysisOutput } from '@/ai/agents/infidelity-analysis-schemas';
import type { DecoyOutput } from '@/ai/agents/decoy-schemas';
import type { DossierOutput } from '@/ai/agents/dossier-schemas';

type AgentReportHandlers = {
  [K in AgentReport['agent']]?: (report: Extract<AgentReport, { agent: K }>['report'], store: AppStore) => void;
};

export const agentReportHandlers: AgentReportHandlers = {
  'dr-syntax': (report: DrSyntaxOutput, store) => {
    store.upsertApp('dr-syntax', {
      id: `dr-syntax-report-${new Date().getTime()}`,
      contentProps: report,
    });
  },
  'winston-wolfe': (report: WinstonWolfeOutput, store) => {
    store.upsertApp('winston-wolfe', {
      id: `winston-wolfe-${new Date().getTime()}`,
      contentProps: { suggestedResponse: report.suggestedResponse },
    });
  },
  'kif-kroker': (report: KifKrokerAnalysisOutput, store) => {
    store.upsertApp('kif-kroker', {
      id: `kif-kroker-report-${new Date().getTime()}`,
      contentProps: report,
    });
  },
  'vandelay': (report: VandelayAlibiOutput, store) => {
    store.upsertApp('vandelay', {
      id: `vandelay-report-${new Date().getTime()}`,
      contentProps: { alibi: report },
    });
  },
  'rolodex': (report: RolodexAnalysisOutput, store) => {
    store.upsertApp('rolodex', {
      id: `rolodex-report-${new Date().getTime()}`,
      contentProps: report,
    });
  },
   'paper-trail': (report: PaperTrailScanOutput, store) => {
    store.upsertApp('paper-trail', {
      id: `paper-trail-${new Date().getTime()}`,
      contentProps: { evidenceLog: [report] },
    });
  },
  'jroc': (report: JrocOutput, store) => {
    store.upsertApp('jroc-business-kit', {
        id: `jroc-kit-${new Date().getTime()}`,
        contentProps: report
    });
  },
  'lahey-surveillance': (report: LaheyAnalysisOutput, store) => {
    // Lahey app is a timeline, so we won't directly open a new one.
    // Future implementation could update a central timeline view.
  },
  'foremanator': (report: ForemanatorLogOutput, store) => {
      store.upsertApp('foremanator', {
          id: `foremanator-log-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'sterileish': (report: SterileishAnalysisOutput, store) => {
      store.upsertApp('sterileish', {
          id: `sterileish-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'barbara': (report: BarbaraOutput, store) => {
      store.upsertApp('barbara', {
          id: `barbara-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'auditor': (report: AuditorOutput, store) => {
      store.upsertApp('auditor-generalissimo', {
          id: `auditor-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'wingman': (report: WingmanOutput, store) => {
      store.upsertApp('beep-wingman', {
          id: `wingman-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'kendra': (report: KendraOutput, store) => {
      store.upsertApp('kendra', {
          id: `kendra-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'orphean-oracle': (report: OrpheanOracleOutput, store) => {
      store.upsertApp('orphean-oracle', {
          id: `oracle-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'lumbergh': (report: LumberghAnalysisOutput, store) => {
      store.upsertApp('project-lumbergh', {
          id: `lumbergh-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'lucille-bluth': (report: LucilleBluthOutput, store) => {
      store.upsertApp('lucille-bluth', {
          id: `lucille-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'pam-poovey': (report: PamAudioOutput, store) => {
      store.upsertApp('pam-poovey-onboarding', {
          id: `pam-rant-${new Date().getTime()}`,
          contentProps: report
      });
  },
   'stonks': (report: StonksBotOutput, store) => {
      store.upsertApp('stonks-bot', {
          id: `stonks-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'reno-mode': (report: RenoModeAnalysisOutput, store) => {
      store.upsertApp('reno-mode', {
          id: `reno-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'patrickt-app': (report: PatricktAgentOutput, store) => {
      // The Patrickt app has its own internal state management
  },
   'vin-diesel': (report: VinDieselOutput, store) => {
      store.upsertApp('vin-diesel', {
          id: `vin-diesel-report-${new Date().getTime()}`,
          contentProps: report
      });
  },
  'inventory-daemon': (report: InventoryDaemonOutput, store) => {
      // The daemon's response is part of BEEP's responseText, not a new app
  },
  'ritual-quests': (report: RitualQuestOutput, store) => {
    store.upsertApp('ritual-quests', {
      id: 'singleton-ritual-quests',
      contentProps: report,
    });
  },
  'dossier': (report: DossierOutput, store) => {
    store.upsertApp('infidelity-radar', {
        id: `singleton-infidelity-radar`,
        contentProps: {
            dossierReport: report,
        }
    });
  },
  'osint': (report: OsintOutput, store) => {
    store.upsertApp('infidelity-radar', {
        id: `singleton-infidelity-radar`,
        contentProps: {
            osintReport: report,
        }
    });
  },
   'infidelity-analysis': (report: InfidelityAnalysisOutput, store) => {
    store.upsertApp('infidelity-radar', {
        id: `singleton-infidelity-radar`,
        contentProps: {
            analysisResult: report,
        }
    });
  },
   'decoy': (report: DecoyOutput, store) => {
    store.upsertApp('infidelity-radar', {
        id: `singleton-infidelity-radar`,
        contentProps: {
            decoyResult: report,
        }
    });
  },
  'crm': (report: CrmAgentReport, store) => {
    if (report.action === 'list') {
      store.upsertApp('contact-list', {
        id: 'singleton-contact-list',
        contentProps: { contacts: report.report }
      });
    } else if (report.action === 'create' || report.action === 'update') {
      const contactId = report.report.id;
      store.closeApp(`contact-editor-${contactId}`);
      store.closeApp('contact-editor-new');
      store.handleCommandSubmit('show me my contacts');
    } else if (report.action === 'delete') {
      store.handleCommandSubmit('show me my contacts');
    }
  },
  'billing': (report: BillingAgentReport, store) => {
    if (report.action === 'get_usage') {
        store.upsertApp('usage-monitor', {
            id: 'singleton-usage-monitor',
            contentProps: { usageDetails: report.report },
        });
    }
  },
};
