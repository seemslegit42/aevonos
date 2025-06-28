
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import MicroAppCanvas from '@/components/micro-app-grid';
import { useAppStore } from '@/store/app-store';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyCanvas from '@/components/canvas/empty-canvas';

export default function Home() {
  const { apps, handleDragEnd, handleCommandSubmit, isLoading } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  const recalledRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    // Initial action on load to recall the last session.
    if (!recalledRef.current) {
        handleCommandSubmit('recall last session');
        recalledRef.current = true;
    }
  }, [handleCommandSubmit]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  if (!isMounted) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-grow p-4 rounded-lg">
           <Skeleton className="h-full w-full" />
        </div>
         <footer className="text-center text-xs text-muted-foreground flex-shrink-0">
            <p>ΛΞVON OS - All rights reserved. | <Link href="/armory" className="hover:text-primary underline">Visit the Armory</Link> | <Link href="/loom" className="hover:text-primary underline">Enter Loom Studio</Link> | <Link href="/validator" className="hover:text-primary underline">Verify Dossier</Link></p>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow p-4 rounded-lg">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {apps.length > 0 ? (
            <MicroAppCanvas apps={apps} />
          ) : (
            <EmptyCanvas />
          )}
        </DndContext>
      </div>
      <footer className="text-center text-xs text-muted-foreground flex-shrink-0">
        <p>ΛΞVON OS - All rights reserved. | <Link href="/armory" className="hover:text-primary underline">Visit the Armory</Link> | <Link href="/loom" className="hover:text-primary underline">Enter Loom Studio</Link> | <Link href="/validator" className="hover:text-primary underline">Verify Dossier</Link></p>
      </footer>
    </div>
  );
}
