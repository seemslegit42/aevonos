
import React from 'react';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { PamPooveyIcon } from '@/components/icons/PamPooveyIcon';
import { AddressBookIcon } from '@/components/icons/AddressBookIcon';
import { VinDieselIcon } from '@/components/icons/VinDieselIcon';
import { LumberghIcon } from '@/components/icons/LumberghIcon';
import { LucilleBluthIcon } from '@/components/icons/LucilleBluthIcon';
import { RolodexIcon } from '@/components/icons/RolodexIcon';
import { WinstonWolfeIcon } from '@/components/icons/WinstonWolfeIcon';
import { KifKrokerIcon } from '@/components/icons/KifKrokerIcon';
import { VandelayIcon } from '@/components/icons/VandelayIcon';
import { EyeOff, UserPlus } from 'lucide-react';
import { OrpheanOracleIcon } from './icons/OrpheanOracleIcon';
import { PaperTrailIcon } from './icons/PaperTrailIcon';
import { JrocIcon } from './icons/JrocIcon';
import { LaheyIcon } from './icons/LaheyIcon';
import { ForemanatorIcon } from './icons/ForemanatorIcon';
import { SterileishIcon } from './icons/SterileishIcon';
import { BarbaraIcon } from './icons/BarbaraIcon';
import { AuditorGeneralissimoIcon } from './icons/AuditorGeneralissimoIcon';
import { BeepWingmanIcon } from './icons/BeepWingmanIcon';
import { KendraIcon } from './icons/KendraIcon';
import { AegisThreatScopeIcon } from './icons/AegisThreatScopeIcon';
import { AegisCommandIcon } from './icons/AegisCommandIcon';
import { UsageMonitorIcon } from './icons/UsageMonitorIcon';
import { ArmoryIcon } from './icons/ArmoryIcon';
import { DrSyntaxIcon } from './icons/DrSyntaxIcon';
import { UserSettingsIcon } from './icons/UserSettingsIcon';
import { WorkspaceSettingsIcon } from './icons/WorkspaceSettingsIcon';
import { TopUpIcon } from './icons/TopUpIcon';
import { StonksIcon } from './icons/StonksIcon';
import { OracleOfDelphiValleyIcon } from './icons/OracleOfDelphiValleyIcon';
import { AdminConsoleIcon } from './icons/AdminConsoleIcon';
import { ValidatorIcon } from './icons/ValidatorIcon';
import { RenoModeIcon } from './icons/RenoModeIcon';
import { PatricktIcon } from './icons/PatricktIcon';
import { HowardsSidekickIcon } from './icons/HowardsSidekickIcon';
import { SisyphusIcon } from './icons/SisyphusIcon';

import { type MicroAppType } from '@/store/app-store';
import ContactList from './micro-apps/contact-list';
import AegisReport from './micro-apps/aegis-report';
import PamPooveyOnboarding from './micro-apps/pam-poovey-onboarding';
import InfidelityRadar from './micro-apps/infidelity-radar';
import VinDiesel from './micro-apps/vin-diesel';
import ProjectLumbergh from './micro-apps/project-lumbergh';
import TheLucilleBluth from './micro-apps/lucille-bluth';
import TheRolodex from './micro-apps/rolodex';
import TheWinstonWolfe from './micro-apps/winston-wolfe';
import TheKifKroker from './micro-apps/kif-kroker';
import Vandelay from './micro-apps/vandelay';
import OrpheanOracle from './micro-apps/orphean-oracle';
import PaperTrail from './micro-apps/paper-trail';
import JrocBusinessKit from './micro-apps/jroc-business-kit';
import LaheyCommander from './micro-apps/lahey-commander';
import TheForemanator from './micro-apps/the-foremanator';
import Sterileish from './micro-apps/sterileish';
import Barbara from './micro-apps/barbara';
import AuditorGeneralissimo from './micro-apps/auditor-generalissimo';
import BeepWingman from './micro-apps/beep-wingman';
import Kendra from './micro-apps/kendra';
import AegisThreatScope from './micro-apps/aegis-threatscope';
import AegisCommand from './micro-apps/aegis-command';
import UsageMonitor from './micro-apps/usage-monitor';
import Armory from './micro-apps/armory';
import ContactEditor from './micro-apps/contact-editor';
import DrSyntax from './micro-apps/dr-syntax';
import UserProfileSettings from './micro-apps/user-profile-settings';
import WorkspaceSettings from './micro-apps/workspace-settings';
import TopUp from './micro-apps/top-up';
import StonksBot from './micro-apps/stonks-bot';
import OracleOfDelphiValley from './micro-apps/oracle-of-delphi-valley';
import SisyphusAscent from './micro-apps/sisyphus-ascent';
import AdminConsole from './micro-apps/admin-console';
import Validator from './micro-apps/validator';
import RenoMode from './micro-apps/reno-mode';
import PatricktApp from './micro-apps/patrickt';
import HowardsSidekick from './micro-apps/howards-sidekick';

type ComponentRegistry = {
    icon: React.ComponentType<any>;
    content?: React.ComponentType<any>;
};

export const microAppRegistry: Record<MicroAppType, ComponentRegistry> = {
  'file-explorer': {
    icon: FileExplorerIcon,
  },
  'terminal': {
    icon: TerminalIcon,
  },
  'ai-suggestion': {
      icon: CrystalIcon,
  },
  'aegis-control': {
    icon: AegisIcon,
    content: AegisReport,
  },
  'contact-list': {
    icon: AddressBookIcon,
    content: ContactList,
  },
  'contact-editor': {
    icon: UserPlus,
    content: ContactEditor,
  },
  'pam-poovey-onboarding': {
    icon: PamPooveyIcon,
    content: PamPooveyOnboarding,
  },
  'infidelity-radar': {
    icon: EyeOff,
    content: InfidelityRadar,
  },
  'vin-diesel': {
    icon: VinDieselIcon,
    content: VinDiesel,
  },
  'project-lumbergh': {
    icon: LumberghIcon,
    content: ProjectLumbergh,
  },
  'lucille-bluth': {
    icon: LucilleBluthIcon,
    content: TheLucilleBluth,
  },
  'rolodex': {
    icon: RolodexIcon,
    content: TheRolodex,
  },
  'winston-wolfe': {
    icon: WinstonWolfeIcon,
    content: TheWinstonWolfe,
  },
  'kif-kroker': {
    icon: KifKrokerIcon,
    content: TheKifKroker,
  },
  'vandelay': {
    icon: VandelayIcon,
    content: Vandelay,
  },
  'orphean-oracle': {
    icon: OrpheanOracleIcon,
    content: OrpheanOracle,
  },
  'paper-trail': {
      icon: PaperTrailIcon,
      content: PaperTrail,
  },
  'jroc-business-kit': {
      icon: JrocIcon,
      content: JrocBusinessKit,
  },
  'lahey-surveillance': {
      icon: LaheyIcon,
      content: LaheyCommander,
  },
  'foremanator': {
      icon: ForemanatorIcon,
      content: TheForemanator,
  },
  'sterileish': {
      icon: SterileishIcon,
      content: Sterileish,
  },
  'barbara': {
      icon: BarbaraIcon,
      content: Barbara,
  },
  'auditor-generalissimo': {
    icon: AuditorGeneralissimoIcon,
    content: AuditorGeneralissimo,
  },
  'beep-wingman': {
    icon: BeepWingmanIcon,
    content: BeepWingman,
  },
  'kendra': {
    icon: KendraIcon,
    content: Kendra,
  },
  'aegis-threatscope': {
    icon: AegisThreatScopeIcon,
    content: AegisThreatScope,
  },
  'aegis-command': {
    icon: AegisCommandIcon,
    content: AegisCommand,
  },
  'usage-monitor': {
    icon: UsageMonitorIcon,
    content: UsageMonitor,
  },
  'armory': {
    icon: ArmoryIcon,
    content: Armory,
  },
  'dr-syntax': {
    icon: DrSyntaxIcon,
    content: DrSyntax,
  },
  'stonks-bot': {
    icon: StonksIcon,
    content: StonksBot,
  },
  'user-profile-settings': {
      icon: UserSettingsIcon,
      content: UserProfileSettings,
  },
  'workspace-settings': {
      icon: WorkspaceSettingsIcon,
      content: WorkspaceSettings,
  },
  'top-up': {
      icon: TopUpIcon,
      content: TopUp,
  },
  'oracle-of-delphi-valley': {
    icon: OracleOfDelphiValleyIcon,
    content: OracleOfDelphiValley,
  },
  'sisyphus-ascent': {
    icon: SisyphusIcon,
    content: SisyphusAscent,
  },
  'admin-console': {
    icon: AdminConsoleIcon,
    content: AdminConsole,
  },
  'validator': {
    icon: ValidatorIcon,
    content: Validator,
  },
  'reno-mode': {
    icon: RenoModeIcon,
    content: RenoMode,
  },
  'patrickt-app': {
    icon: PatricktIcon,
    content: PatricktApp,
  },
  'howards-sidekick': {
    icon: HowardsSidekickIcon,
    content: HowardsSidekick,
  },
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
