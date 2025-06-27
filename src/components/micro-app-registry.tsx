import React from 'react';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { EchoIcon } from '@/components/icons/EchoIcon';
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
  },
  'ai-suggestion': {
      icon: CrystalIcon,
  },
  'echo-control': {
    icon: EchoIcon,
  },
};

export const getAppIcon = (type: MicroAppType) => {
    return microAppRegistry[type]?.icon || CrystalIcon;
}

export const getAppContent = (type: MicroAppType) => {
    return microAppRegistry[type]?.content;
}
