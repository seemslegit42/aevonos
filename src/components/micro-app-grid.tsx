'use client';

import React from 'react';
import MicroAppCard from './micro-app-card';
import { type MicroApp } from '@/store/app-store';

interface MicroAppGridProps {
  apps: MicroApp[];
}

export default function MicroAppGrid({ apps }: MicroAppGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {apps.map((app, index) => (
        <MicroAppCard key={app.id} app={app} index={index} />
      ))}
    </div>
  );
}
