
import React from 'react';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { EchoIcon } from '@/components/icons/EchoIcon';
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
import { EyeOff } from 'lucide-react';
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
import { StonksIcon } from './icons/StonksIcon';

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
import StonksBot from './micro-apps/stonks-bot';

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
  'echo-recall': {
    icon: EchoIcon,
  },
  'aegis-control': {
    icon: AegisIcon,
    content: AegisReport,
  },
  'contact-list': {
    icon: AddressBookIcon,
    content: ContactList,
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
  'the-foremanator': {
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
  'stonks-bot': {
    icon: StonksIcon,
    content: StonksBot,
  },
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
