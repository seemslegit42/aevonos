
'use client';

import React, { useState, useEffect } from 'react';
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
import EmptyCanvas from '@/components/canvas/empty-canvas';

export default function Home() {
  const { apps, handleDragEnd } = useAppStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the component mounts.
    setIsClient(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );
  
  // On the server and during the initial client render, `isClient` is false.
  // We render a consistent placeholder to ensure server and client match.
  if (!isClient) {
    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow p-4 rounded-lg">
                <EmptyCanvas />
            </div>
            <footer className="text-center text-xs text-muted-foreground flex-shrink-0">
                <p>ΛΞVON OS - All rights reserved. | <Link href="/armory" className="hover:text-primary underline">Visit the Armory</Link> | <Link href="/loom" className="hover:text-primary underline">Enter Loom Studio</Link> | <Link href="/validator" className="hover:text-primary underline">Verify Dossier</Link></p>
            </footer>
        </div>
    );
  }
  
  // After hydration, `isClient` becomes true, and we render the full component.
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
