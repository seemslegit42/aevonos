'use client';

import React from 'react';
import MicroAppCard from './micro-app-card';
import { type MicroApp } from '@/store/app-store';

interface MicroAppGridProps {
  apps: MicroApp[];
}

export default function MicroAppGrid({ apps }: MicroAppGridProps) {
  return (
    <div className="relative w-full h-full">
      {apps.map((app) => (
        <MicroAppCard key={app.id} app={app} />
      ))}
      {apps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-muted-foreground animate-in fade-in-50 duration-1000">
                  <h2 className="text-2xl font-headline text-foreground">The Canvas is Listening.</h2>
                  <p className="mt-1">Use the command bar above to begin.</p>
              </div>
          </div>
      )}
    </div>
  );
}
