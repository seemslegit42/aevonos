'use client';

import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface TopBarProps {
  onCommandSubmit: (command: string) => void;
  isLoading: boolean;
}

export default function TopBar({ onCommandSubmit, isLoading }: TopBarProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const command = formData.get('command') as string;
    onCommandSubmit(command);
    formRef.current?.reset();
  };

  return (
    <header className="flex items-center justify-between w-full px-4 py-2 bg-foreground/15 backdrop-blur-[20px] rounded-lg border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)]">
      <div className="flex items-center">
        <h1 className="text-xl font-headline font-bold text-foreground tracking-widest">
          <span className="text-primary">ΛΞ</span>VON
        </h1>
      </div>
      <div className="flex-1 max-w-xl">
        <form ref={formRef} onSubmit={handleSubmit} className="relative">
          <Input
            name="command"
            type="text"
            placeholder="BEEP: Tell me what you want to achieve..."
            className="w-full bg-input/10 border border-foreground/20 focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0 pl-10 h-10"
            disabled={isLoading}
          />
          <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
        </form>
      </div>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>Aegis: Online</span>
        </div>
        <span>Session: Active</span>
      </div>
    </header>
  );
}
