
import React from 'react';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { FileExplorerIcon } from './icons/FileExplorerIcon';
import { AddressBookIcon } from './icons/AddressBookIcon';
import { DrSyntaxIcon } from './icons/DrSyntaxIcon';

import Terminal from './micro-apps/terminal';
import AegisReport from './micro-apps/aegis-report';
import DrSyntax from './micro-apps/dr-syntax';

import { type MicroAppType } from '@/store/app-store';

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
  },
  'dr-syntax': {
    icon: DrSyntaxIcon,
    content: DrSyntax,
  },
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
