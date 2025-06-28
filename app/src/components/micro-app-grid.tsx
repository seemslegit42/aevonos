
'use client';

import React from 'react';
import MicroAppCard from './micro-app-card';
import { type MicroApp } from '@/store/app-store';
import EmptyCanvas from './canvas/empty-canvas';

interface MicroAppCanvasProps {
  apps: MicroApp[];
}

export default function MicroAppCanvas({ apps }: MicroAppCanvasProps) {
  if (apps.length === 0) {
      return <EmptyCanvas />;
  }
  
  return (
    <div className="relative w-full h-full">
      {apps.map((app) => (
        <MicroAppCard key={app.id} app={app} />
      ))}
    </div>
  );
}
