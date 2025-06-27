
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
import { OracleIcon } from './icons/OracleIcon';
import { PaperTrailIcon } from './icons/PaperTrailIcon';
import { JrocIcon } from './icons/JrocIcon';
import { LaheyIcon } from './icons/LaheyIcon';
import { ForemanatorIcon } from './icons/ForemanatorIcon';
import { SterileishIcon } from './icons/SterileishIcon';


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
import Oracle from './micro-apps/oracle';
import PaperTrail from './micro-apps/paper-trail';
import JrocBusinessKit from './micro-apps/jroc-business-kit';
import LaheyCommander from './micro-apps/lahey-commander';
import TheForemanator from './micro-apps/the-foremanator';
import Sterileish from './micro-apps/sterileish';


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
  'echo-control': {
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
  'oracle': {
    icon: OracleIcon,
    content: Oracle,
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
  }
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
