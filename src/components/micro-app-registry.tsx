

import React from 'react';
import dynamic from 'next/dynamic';
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
import { HardHat } from 'lucide-react'; // Placeholder for Inventory
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
import { type MicroAppType } from '@/store/app-store';
import { Skeleton } from './ui/skeleton';

// --- Lazy Load ALL MicroApp Content Components ---
const LoadingSkeleton = () => <div className="p-4"><Skeleton className="h-full w-full" /></div>;

const Terminal = dynamic(() => import('./micro-apps/terminal'), { loading: LoadingSkeleton });
const AegisReport = dynamic(() => import('./micro-apps/aegis-report'), { loading: LoadingSkeleton });
const DrSyntax = dynamic(() => import('./micro-apps/dr-syntax'), { loading: LoadingSkeleton });
const ContactList = dynamic(() => import('./micro-apps/contact-list'), { loading: LoadingSkeleton });
const ContactEditor = dynamic(() => import('./micro-apps/contact-editor'), { loading: LoadingSkeleton });
const UsageMonitor = dynamic(() => import('./micro-apps/usage-monitor'), { loading: LoadingSkeleton });
const TopUp = dynamic(() => import('./micro-apps/top-up'), { loading: LoadingSkeleton });
const UserProfileSettings = dynamic(() => import('./micro-apps/user-profile-settings'), { loading: LoadingSkeleton });
const WorkspaceSettings = dynamic(() => import('./micro-apps/workspace-settings'), { loading: LoadingSkeleton });
const Armory = dynamic(() => import('./micro-apps/armory'), { loading: LoadingSkeleton });
const AegisThreatScope = dynamic(() => import('./micro-apps/aegis-threatscope'), { loading: LoadingSkeleton });
const AegisCommand = dynamic(() => import('./micro-apps/aegis-command'), { loading: LoadingSkeleton });
const ScribesArchive = dynamic(() => import('./micro-apps/file-explorer'), { loading: LoadingSkeleton });
const LoomPage = dynamic(() => import('@/app/loom/page'), { loading: LoadingSkeleton });
const TheWinstonWolfe = dynamic(() => import('./micro-apps/winston-wolfe'), { loading: LoadingSkeleton });
const TheKifKroker = dynamic(() => import('./micro-apps/kif-kroker'), { loading: LoadingSkeleton });
const TheRolodex = dynamic(() => import('./micro-apps/rolodex'), { loading: LoadingSkeleton });
const Vandelay = dynamic(() => import('./micro-apps/vandelay'), { loading: LoadingSkeleton });
const JrocBusinessKit = dynamic(() => import('./micro-apps/jroc-business-kit'), { loading: LoadingSkeleton });
const LaheyCommander = dynamic(() => import('./micro-apps/lahey-commander'), { loading: LoadingSkeleton });
const TheForemanator = dynamic(() => import('./micro-apps/the-foremanator'), { loading: LoadingSkeleton });
const Sterileish = dynamic(() => import('./micro-apps/sterileish'), { loading: LoadingSkeleton });
const PaperTrail = dynamic(() => import('./micro-apps/paper-trail'), { loading: LoadingSkeleton });
const Barbara = dynamic(() => import('./micro-apps/barbara'), { loading: LoadingSkeleton });
const AuditorGeneralissimo = dynamic(() => import('./micro-apps/auditor-generalissimo'), { loading: LoadingSkeleton });
const BeepWingman = dynamic(() => import('./micro-apps/beep-wingman'), { loading: LoadingSkeleton });
const Kendra = dynamic(() => import('./micro-apps/kendra'), { loading: LoadingSkeleton });
const OrpheanOracle = dynamic(() => import('./micro-apps/orphean-oracle'), { loading: LoadingSkeleton });
const ProjectLumbergh = dynamic(() => import('./micro-apps/project-lumbergh'), { loading: LoadingSkeleton });
const TheLucilleBluth = dynamic(() => import('./micro-apps/lucille-bluth'), { loading: LoadingSkeleton });
const PamPooveyOnboarding = dynamic(() => import('./micro-apps/pam-poovey-onboarding'), { loading: LoadingSkeleton });
const StonksBot = dynamic(() => import('./micro-apps/stonks-bot'), { loading: LoadingSkeleton });
const RenoMode = dynamic(() => import('./micro-apps/reno-mode'), { loading: LoadingSkeleton });
const PatricktApp = dynamic(() => import('./micro-apps/patrickt'), { loading: LoadingSkeleton });
const VinDiesel = dynamic(() => import('./micro-apps/vin-diesel'), { loading: LoadingSkeleton });
const ObeliskMarketplace = dynamic(() => import('./micro-apps/obelisk-marketplace'), { loading: LoadingSkeleton });
const ProxyAgent = dynamic(() => import('./micro-apps/proxy-agent'), { loading: LoadingSkeleton });
const AdminConsole = dynamic(() => import('./micro-apps/admin-console'), { loading: LoadingSkeleton });
const InfidelityRadar = dynamic(() => import('./micro-apps/infidelity-radar'), { loading: LoadingSkeleton });
const RitualQuests = dynamic(() => import('./micro-apps/ritual-quests'), { loading: LoadingSkeleton });
const HowardsSidekick = dynamic(() => import('./micro-apps/howards-sidekick'), { loading: LoadingSkeleton });
const SisyphusAscent = dynamic(() => import('./micro-apps/sisyphus-ascent'), { loading: LoadingSkeleton });
const MerchantOfCabbage = dynamic(() => import('./micro-apps/merchant-of-cabbage'), { loading: LoadingSkeleton });
const CommandAndCauldron = dynamic(() => import('./micro-apps/command-and-cauldron'), { loading: LoadingSkeleton });
const IntegrationNexus = dynamic(() => import('./micro-apps/integration-nexus'), { loading: LoadingSkeleton });
const Validator = dynamic(() => import('./micro-apps/validator'), { loading: LoadingSkeleton });


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
