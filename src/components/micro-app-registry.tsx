
import React from 'react';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { FileExplorerIcon } from './icons/FileExplorerIcon';
import { AddressBookIcon } from './icons/AddressBookIcon';
import { DrSyntaxIcon } from './icons/DrSyntaxIcon';
import { Edit } from 'lucide-react';
import { LoomIcon } from './icons/LoomIcon';
import { WinstonWolfeIcon } from './icons/WinstonWolfeIcon';
import { KifKrokerIcon } from './icons/KifKrokerIcon';
import { RolodexIcon } from './icons/RolodexIcon';
import { VandelayIcon } from './icons/VandelayIcon';
import { JrocIcon } from './icons/JrocIcon';
import { LaheyIcon } from './icons/LaheyIcon';
import { ForemanatorIcon } from './icons/ForemanatorIcon';
import { SterileishIcon } from './icons/SterileishIcon';
import { PaperTrailIcon } from './icons/PaperTrailIcon';
import { BarbaraIcon } from './icons/BarbaraIcon';
import { AuditorGeneralissimoIcon } from './icons/AuditorGeneralissimoIcon';
import { BeepWingmanIcon } from './icons/BeepWingmanIcon';
import { KendraIcon } from './icons/KendraIcon';
import { OrpheanOracleIcon } from './icons/OrpheanOracleIcon';
import { LumberghIcon } from './icons/LumberghIcon';
import { LucilleBluthIcon } from './icons/LucilleBluthIcon';
import { PamPooveyIcon } from './icons/PamPooveyIcon';
import { StonksIcon } from './icons/StonksIcon';
import { RenoModeIcon } from './icons/RenoModeIcon';
import { PatricktIcon } from './icons/PatricktIcon';
import { VinDieselIcon } from './icons/VinDieselIcon';
import { HardHat } from 'lucide-react';
import { ObeliskMarketplaceIcon } from './icons/ObeliskMarketplaceIcon';
import { ProxyAgentIcon } from './icons/ProxyAgentIcon';
import { UsageMonitorIcon } from './icons/UsageMonitorIcon';
import { TopUpIcon } from './icons/TopUpIcon';
import { UserSettingsIcon } from './icons/UserSettingsIcon';
import { WorkspaceSettingsIcon } from './icons/WorkspaceSettingsIcon';
import { ArmoryIcon } from './icons/ArmoryIcon';
import { AegisThreatScopeIcon } from './icons/AegisThreatScopeIcon';
import { AegisCommandIcon } from './icons/AegisCommandIcon';
import { AdminConsoleIcon } from './icons/AdminConsoleIcon';
import { HowardsSidekickIcon } from './icons/HowardsSidekickIcon';
import { InfidelityRadarIcon } from './icons/InfidelityRadarIcon';
import { RitualQuestsIcon } from './icons/RitualQuestsIcon';
import { SisyphusIcon } from './icons/SisyphusIcon';
import { MerchantOfCabbageIcon } from './icons/MerchantOfCabbageIcon';
import { CommandAndCauldronIcon } from './icons/CommandAndCauldronIcon';
import { IntegrationNexusIcon } from './icons/IntegrationNexusIcon';
import { ValidatorIcon } from './icons/ValidatorIcon';


import Terminal from './micro-apps/terminal';
import AegisReport from './micro-apps/aegis-report';
import DrSyntax from './micro-apps/dr-syntax';
import ContactList from './micro-apps/contact-list';
import ContactEditor from './micro-apps/contact-editor';
import UsageMonitor from './micro-apps/usage-monitor';
import TopUp from './micro-apps/top-up';
import UserProfileSettings from './micro-apps/user-profile-settings';
import WorkspaceSettings from './micro-apps/workspace-settings';
import Armory from './micro-apps/armory';
import AegisThreatScope from './micro-apps/aegis-threatscope';
import AegisCommand from './micro-apps/aegis-command';
import ScribesArchive from './micro-apps/file-explorer';
import LoomPage from '@/app/loom/page';
import TheWinstonWolfe from './micro-apps/winston-wolfe';
import TheKifKroker from './micro-apps/kif-kroker';
import TheRolodex from './micro-apps/rolodex';
import Vandelay from './micro-apps/vandelay';
import JrocBusinessKit from './micro-apps/jroc-business-kit';
import LaheyCommander from './micro-apps/lahey-commander';
import TheForemanator from './micro-apps/the-foremanator';
import Sterileish from './micro-apps/sterileish';
import PaperTrail from './micro-apps/paper-trail';
import Barbara from './micro-apps/barbara';
import AuditorGeneralissimo from './micro-apps/auditor-generalissimo';
import BeepWingman from './micro-apps/beep-wingman';
import Kendra from './micro-apps/kendra';
import OrpheanOracle from './micro-apps/orphean-oracle';
import ProjectLumbergh from './micro-apps/project-lumbergh';
import TheLucilleBluth from './micro-apps/lucille-bluth';
import PamPooveyOnboarding from './micro-apps/pam-poovey-onboarding';
import StonksBot from './micro-apps/stonks-bot';
import RenoMode from './micro-apps/reno-mode';
import PatricktApp from './micro-apps/patrickt';
import VinDiesel from './micro-apps/vin-diesel';
import ObeliskMarketplace from './micro-apps/obelisk-marketplace';
import ProxyAgent from './micro-apps/proxy-agent';
import AdminConsole from './micro-apps/admin-console';
import InfidelityRadar from './micro-apps/infidelity-radar';
import RitualQuests from './micro-apps/ritual-quests';
import HowardsSidekick from './micro-apps/howards-sidekick';
import SisyphusAscent from './micro-apps/sisyphus-ascent';
import MerchantOfCabbage from './micro-apps/merchant-of-cabbage';
import CommandAndCauldron from './micro-apps/command-and-cauldron';
import IntegrationNexus from './micro-apps/integration-nexus';
import Validator from './micro-apps/validator';

import { type MicroAppType } from '@/store/app-store';

type ComponentRegistry = {
    icon: React.ComponentType<any>;
    content?: React.ComponentType<any>;
};

export const microAppRegistry: Record<MicroAppType, ComponentRegistry> = {
  'file-explorer': { icon: FileExplorerIcon, content: ScribesArchive },
  'terminal': { icon: TerminalIcon, content: Terminal },
  'ai-suggestion': { icon: CrystalIcon },
  'aegis-control': { icon: AegisIcon, content: AegisReport },
  'contact-list': { icon: AddressBookIcon, content: ContactList },
  'dr-syntax': { icon: DrSyntaxIcon, content: DrSyntax },
  'contact-editor': { icon: Edit, content: ContactEditor },
  'usage-monitor': { icon: UsageMonitorIcon, content: UsageMonitor },
  'top-up': { icon: TopUpIcon, content: TopUp },
  'user-profile-settings': { icon: UserSettingsIcon, content: UserProfileSettings },
  'workspace-settings': { icon: WorkspaceSettingsIcon, content: WorkspaceSettings },
  'armory': { icon: ArmoryIcon, content: Armory },
  'aegis-threatscope': { icon: AegisThreatScopeIcon, content: AegisThreatScope },
  'aegis-command': { icon: AegisCommandIcon, content: AegisCommand },
  'admin-console': { icon: AdminConsoleIcon, content: AdminConsole },
  'loom': { icon: LoomIcon, content: LoomPage },
  'winston-wolfe': { icon: WinstonWolfeIcon, content: TheWinstonWolfe },
  'kif-kroker': { icon: KifKrokerIcon, content: TheKifKroker },
  'vandelay': { icon: VandelayIcon, content: Vandelay },
  'rolodex': { icon: RolodexIcon, content: TheRolodex },
  'jroc-business-kit': { icon: JrocIcon, content: JrocBusinessKit },
  'lahey-surveillance': { icon: LaheyIcon, content: LaheyCommander },
  'foremanator': { icon: ForemanatorIcon, content: TheForemanator },
  'sterileish': { icon: SterileishIcon, content: Sterileish },
  'paper-trail': { icon: PaperTrailIcon, content: PaperTrail },
  'barbara': { icon: BarbaraIcon, content: Barbara },
  'auditor-generalissimo': { icon: AuditorGeneralissimoIcon, content: AuditorGeneralissimo },
  'beep-wingman': { icon: BeepWingmanIcon, content: BeepWingman },
  'kendra': { icon: KendraIcon, content: Kendra },
  'orphean-oracle': { icon: OrpheanOracleIcon, content: OrpheanOracle },
  'project-lumbergh': { icon: LumberghIcon, content: ProjectLumbergh },
  'lucille-bluth': { icon: LucilleBluthIcon, content: TheLucilleBluth },
  'pam-poovey-onboarding': { icon: PamPooveyIcon, content: PamPooveyOnboarding },
  'stonks-bot': { icon: StonksIcon, content: StonksBot },
  'reno-mode': { icon: RenoModeIcon, content: RenoMode },
  'patrickt-app': { icon: PatricktIcon, content: PatricktApp },
  'vin-diesel': { icon: VinDieselIcon, content: VinDiesel },
  'inventory-daemon': { icon: HardHat }, // No UI for this daemon
  'obelisk-marketplace': { icon: ObeliskMarketplaceIcon, content: ObeliskMarketplace },
  'proxy-agent': { icon: ProxyAgentIcon, content: ProxyAgent },
  'infidelity-radar': { icon: InfidelityRadarIcon, content: InfidelityRadar },
  'ritual-quests': { icon: RitualQuestsIcon, content: RitualQuests },
  'howards-sidekick': { icon: HowardsSidekickIcon, content: HowardsSidekick },
  'sisyphus-ascent': { icon: SisyphusIcon, content: SisyphusAscent },
  'merchant-of-cabbage': { icon: MerchantOfCabbageIcon, content: MerchantOfCabbage },
  'command-and-cauldron': { icon: CommandAndCauldronIcon, content: CommandAndCauldron },
  'integration-nexus': { icon: IntegrationNexusIcon, content: IntegrationNexus },
  'validator': { icon: ValidatorIcon, content: Validator },
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
