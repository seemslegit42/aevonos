
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
    </div>
  );
}
