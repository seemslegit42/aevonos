
'use client';

import React, { useState, useEffect } from 'react';
import MicroAppCard from './micro-app-card';
import { type MicroApp } from '@/store/app-store';
import { FlowerOfLifeIcon } from './icons/FlowerOfLifeIcon';
import FirstWhisperCard from '@/components/layout/FirstWhisperCard';
import type { User } from '@prisma/client';

interface MicroAppGridProps {
  apps: MicroApp[];
  user: User | null;
}

export function MicroAppGrid({ apps, user }: MicroAppGridProps) {
  const [showWhisper, setShowWhisper] = useState(false);

  useEffect(() => {
    if (apps.length === 0 && user?.firstWhisper) {
      setShowWhisper(true);
    } else {
      setShowWhisper(false);
    }
  }, [apps.length, user]);

  const onWhisperAction = () => {
    setShowWhisper(false); // Hide immediately on action
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {apps.map((app) => (
        <MicroAppCard key={app.id} app={app} />
      ))}
      
      {showWhisper && user ? (
          <FirstWhisperCard user={user} onAction={onWhisperAction} />
      ) : apps.length === 0 ? (
          <div className="text-center text-muted-foreground animate-in fade-in-50 duration-1000 flex flex-col items-center pointer-events-none">
              <FlowerOfLifeIcon className="w-24 h-24 text-primary/30" />
              <h2 className="text-2xl font-headline text-foreground mt-4">The Canvas Awaits Your Command.</h2>
              <p className="mt-1 italic">"Speak, and the system will answer."</p>
          </div>
      ) : null}
    </div>
  );
}
