
'use client';

import React from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import MicroAppGrid from '@/components/micro-app-grid';
import { useAppStore } from '@/store/app-store';

export default function Home() {
  const { apps, handleDragEnd } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 rounded-lg">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <MicroAppGrid apps={apps} />
        </DndContext>
      </div>
      <footer className="text-center text-xs text-muted-foreground flex-shrink-0">
        <p>ΛΞVON OS - All rights reserved. | <Link href="/armory" className="hover:text-primary underline">Visit the Armory</Link> | <Link href="/loom" className="hover:text-primary underline">Enter Loom Studio</Link> | <Link href="/validator" className="hover:text-primary underline">Verify Dossier</Link></p>
      </footer>
    </div>
  );
}
