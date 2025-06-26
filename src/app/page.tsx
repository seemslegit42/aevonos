'use client';

import React, { useState, useTransition } from 'react';
import TopBar from '@/components/layout/top-bar';
import MicroAppGrid from '@/components/micro-app-grid';
import { handleCommand, checkForAnomalies } from '@/app/actions';

import { LoomIcon } from '@/components/icons/LoomIcon';
import { FileExplorerIcon } from '@/components/icons/FileExplorerIcon';
import { TerminalIcon } from '@/components/icons/TerminalIcon';
import { AegisIcon } from '@/components/icons/AegisIcon';
import { CrystalIcon } from '@/components/icons/CrystalIcon';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

export interface MicroApp {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  description: string;
  action?: () => void;
}

export default function Home() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [aegisStatus, setAegisStatus] = useState<'Secure' | 'Anomaly Detected' | 'Scanning...'>('Secure');

  const runAnomalyCheck = () => {
    startTransition(async () => {
      setAegisStatus('Scanning...');
      const result = await checkForAnomalies('User accessed financial_records.csv and project_phoenix.docx then initiated a data transfer to an external IP.');
      if (result.isAnomalous) {
        setAegisStatus('Anomaly Detected');
        toast({
          variant: 'destructive',
          title: 'Aegis Alert: Anomaly Detected',
          description: result.anomalyExplanation,
        });
      } else {
        setAegisStatus('Secure');
        toast({
          title: 'Aegis Scan Complete',
          description: 'No anomalies detected in the simulated activity.',
        });
      }
    });
  };

  const [apps, setApps] = useState<MicroApp[]>([
    {
      id: '1',
      title: 'Loom Studio',
      icon: LoomIcon,
      description: 'Visual command center for AI workflows.',
    },
    {
      id: '2',
      title: 'File Explorer',
      icon: FileExplorerIcon,
      description: 'Access and manage your files.',
    },
    {
      id: '3',
      title: 'Terminal',
      icon: TerminalIcon,
      description: 'Direct command-line access.',
    },
    {
      id: '4',
      title: 'Aegis Control',
      icon: AegisIcon,
      description: 'Run a sample security scan.',
      action: runAnomalyCheck,
    },
  ]);

  const handleCommandSubmit = (command: string) => {
    if (!command) return;
    startTransition(async () => {
      const suggestedCommands = await handleCommand(command);
      const newApps: MicroApp[] = suggestedCommands.map((cmd, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: cmd,
        icon: CrystalIcon,
        description: 'AI-suggested micro-app.',
      }));
      setApps(prev => [...prev.filter(app => !app.id.startsWith('ai-')), ...newApps]);
    });
  };

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar onCommandSubmit={handleCommandSubmit} isLoading={isPending} aegisStatus={aegisStatus} />
      <div className="flex-grow p-4 rounded-lg">
        <MicroAppGrid apps={apps} />
      </div>
       <footer className="text-center text-xs text-muted-foreground">
        <p>ΛΞVON OS - All rights reserved.</p>
      </footer>
    </div>
  );
}
