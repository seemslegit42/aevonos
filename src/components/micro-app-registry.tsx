import React from 'react';
import { LoomIcon } from '@/components/icons/LoomIcon';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { DrSyntaxIcon } from '@/components/icons/DrSyntaxIcon';
import { EchoIcon } from '@/components/icons/EchoIcon';
import { AegisReportApp } from '@/components/aegis-report-app';
import { EchoRecallApp } from '@/components/echo-recall-app';
import { type MicroAppType } from '@/store/app-store';
import { DrSyntaxReportApp } from '@/components/dr-syntax-report-app';

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
  'aegis-report': {
      icon: AegisIcon,
      content: AegisReportApp,
  },
  'dr-syntax-report': {
      icon: DrSyntaxIcon,
      content: DrSyntaxReportApp,
  },
  'ai-suggestion': {
      icon: CrystalIcon,
  },
  'echo-control': {
    icon: EchoIcon,
  },
  'echo-recall': {
    icon: EchoIcon,
    content: EchoRecallApp,
  },
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
