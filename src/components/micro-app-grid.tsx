'use client';

import React from 'react';
import MicroAppCard from './micro-app-card';
import { type MicroApp } from '@/store/app-store';
import { FlowerOfLifeIcon } from './icons/FlowerOfLifeIcon';

interface MicroAppGridProps {
  apps: MicroApp[];
}

export function MicroAppGrid({ apps }: MicroAppGridProps) {
  return (
    <div className="relative w-full h-full">
      {apps.map((app) => (
        <MicroAppCard key={app.id} app={app} />
      ))}
      {apps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground animate-in fade-in-50 duration-1000 flex flex-col items-center">
                  <FlowerOfLifeIcon className="w-24 h-24 text-primary/30" />
                  <h2 className="text-2xl font-headline text-foreground mt-4">The Canvas Awaits Your Command.</h2>
                  <p className="mt-1 italic">"Speak, and the system will answer."</p>
              </div>
          </div>
      )}
    </div>
  );
}
