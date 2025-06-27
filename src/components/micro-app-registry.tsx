import React from 'react';
import { LoomIcon } from '@/components/icons/LoomIcon';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { DrSyntaxIcon } from '@/components/icons/DrSyntaxIcon';
import { DrSyntaxApp } from '@/components/dr-syntax-app';
import { AegisReportApp } from '@/components/aegis-report-app';
import { type MicroAppType } from '@/store/app-store';

type ComponentRegistry = {
    icon: React.ComponentType<any>;
    content?: React.ComponentType<any>;
};

export const microAppRegistry: Record<MicroAppType, ComponentRegistry> = {
  'loom-studio': {
    icon: LoomIcon,
  },
  'file-explorer': {
    icon: FileExplorerIcon,
  },
  'terminal': {
    icon: TerminalIcon,
  },
  'aegis-control': {
    icon: AegisIcon,
  },
  'dr-syntax': {
    icon: DrSyntaxIcon,
    content: DrSyntaxApp,
  },
  'aegis-report': {
      icon: AegisIcon,
      content: AegisReportApp,
  },
  'ai-suggestion': {
      icon: CrystalIcon,
  },
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
