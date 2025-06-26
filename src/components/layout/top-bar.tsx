'use client';

import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sparkles, ShieldCheck, ShieldAlert } from 'lucide-react';

interface TopBarProps {
  onCommandSubmit: (command: string) => void;
  isLoading: boolean;
  aegisStatus: 'Secure' | 'Anomaly Detected' | 'Scanning...';
}

export default function TopBar({ onCommandSubmit, isLoading, aegisStatus }: TopBarProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const command = formData.get('command') as string;
    onCommandSubmit(command);
    formRef.current?.reset();
  };
  
  const AegisStatusIcon = () => {
    switch(aegisStatus) {
      case 'Secure':
        return <ShieldCheck className="w-4 h-4 text-green-400" />;
      case 'Anomaly Detected':
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'Scanning...':
        return <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />;
    }
  };

  return (
    <header className="flex items-center justify-between w-full px-4 py-2 bg-black/10 backdrop-blur-md rounded-lg border border-gray-700/50 shadow-lg">
      <div className="flex items-center">
        <h1 className="text-xl font-headline font-bold text-gray-200 tracking-widest">
          <span className="text-primary">ΛΞ</span>VON
        </h1>
      </div>
      <div className="flex-1 max-w-xl">
        <form ref={formRef} onSubmit={handleSubmit} className="relative">
          <Input
            name="command"
            type="text"
            placeholder="BEEP: Tell me what you want to achieve..."
            className="w-full bg-input border-0 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 pl-10 h-10"
            disabled={isLoading}
          />
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
        </form>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <AegisStatusIcon />
            <span>Aegis: {aegisStatus}</span>
        </div>
        <span>Session: Active</span>
      </div>
    </header>
  );
}
