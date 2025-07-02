
import React from 'react';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { FileExplorerIcon } from './icons/FileExplorerIcon';
import { AddressBookIcon } from './icons/AddressBookIcon';
import { DrSyntaxIcon } from './icons/DrSyntaxIcon';
import { Edit } from 'lucide-react';
import { LayoutGrid, AppWindow, Cog, Shield, LifeBuoy, ShoppingCart } from 'lucide-react';
import { LoomIcon } from './icons/LoomIcon';
import { WinstonWolfeIcon } from './icons/WinstonWolfeIcon';
import { ObeliskMarketplaceIcon } from './icons/ObeliskMarketplaceIcon';
import { ProxyAgentIcon } from './icons/ProxyAgentIcon';

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
import ObeliskMarketplace from './micro-apps/obelisk-marketplace';
import ProxyAgent from './micro-apps/proxy-agent';

import { type MicroAppType } from '@/store/app-store';

type ComponentRegistry = {
    icon: React.ComponentType<any>;
    content?: React.ComponentType<any>;
};

export const microAppRegistry: Record<MicroAppType, ComponentRegistry> = {
  'file-explorer': {
    icon: FileExplorerIcon,
    content: ScribesArchive
  },
  'terminal': {
    icon: TerminalIcon,
    content: Terminal,
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
  'dr-syntax': {
    icon: DrSyntaxIcon,
    content: DrSyntax,
  },
  'contact-editor': {
      icon: Edit,
      content: ContactEditor,
  },
  'usage-monitor': {
      icon: AppWindow, // Placeholder, needs specific icon
      content: UsageMonitor,
  },
  'top-up': {
      icon: AppWindow, // Placeholder
      content: TopUp,
  },
  'user-profile-settings': {
      icon: Cog, // Placeholder
      content: UserProfileSettings,
  },
  'workspace-settings': {
      icon: Cog, // Placeholder
      content: WorkspaceSettings,
  },
  'armory': {
      icon: ShoppingCart, // Placeholder
      content: Armory,
  },
  'aegis-threatscope': {
      icon: Shield, // Placeholder
      content: AegisThreatScope,
  },
  'aegis-command': {
      icon: Shield, // Placeholder
      content: AegisCommand,
  },
  'loom': {
    icon: LoomIcon,
    content: LoomPage,
  },
  'winston-wolfe': {
    icon: WinstonWolfeIcon,
    content: TheWinstonWolfe
  },
  'obelisk-marketplace': {
    icon: ObeliskMarketplaceIcon,
    content: ObeliskMarketplace,
  },
  'proxy-agent': {
    icon: ProxyAgentIcon,
    content: ProxyAgent,
  }
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
