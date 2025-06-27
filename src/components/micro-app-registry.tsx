
import React from 'react';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { EchoIcon } from '@/components/icons/EchoIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { PamPooveyIcon } from '@/components/icons/PamPooveyIcon';
import { BeepWingmanIcon } from '@/components/icons/BeepWingmanIcon';
import { AddressBookIcon } from '@/components/icons/AddressBookIcon';
import { VinDieselIcon } from '@/components/icons/VinDieselIcon';
import { LumberghIcon } from '@/components/icons/LumberghIcon';
import { LucilleBluthIcon } from '@/components/icons/LucilleBluthIcon';
import { RolodexIcon } from '@/components/icons/RolodexIcon';
import { EyeOff } from 'lucide-react';

import { type MicroAppType } from '@/store/app-store';
import ContactList from './micro-apps/contact-list';
import AegisReport from './micro-apps/aegis-report';
import PamPooveyOnboarding from './micro-apps/pam-poovey-onboarding';
import BeepWingman from './micro-apps/beep-wingman';
import InfidelityRadar from './micro-apps/infidelity-radar';
import VinDiesel from './micro-apps/vin-diesel';
import ProjectLumbergh from './micro-apps/project-lumbergh';
import TheLucilleBluth from './micro-apps/lucille-bluth';
import TheRolodex from './micro-apps/rolodex';

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
  'beep-wingman': {
    icon: BeepWingmanIcon,
    content: BeepWingman,
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
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
