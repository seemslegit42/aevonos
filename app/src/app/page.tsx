
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

import MicroAppGrid from '@/components/micro-app-grid';
import { useAppStore } from '@/store/app-store';
import { Skeleton } from '@/components/ui/skeleton';
import { CrystalIcon } from '@/components/icons/CrystalIcon';

export default function Home() {
  const { apps, handleDragEnd, handleCommandSubmit, isLoading } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  const recalledRef = useRef(false);

  useEffect(() => {
    setIsMounted(true);
    // Initial action on load to recall the last session.
    if (!recalledRef.current) {
        // Using a short timeout to give a sense of the OS "booting up"
        // and thinking before it greets the user.
        setTimeout(() => {
            handleCommandSubmit('recall last session');
        }, 500);
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
            <MicroAppGrid apps={apps} />
          ) : (
             !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground animate-in fade-in-50 duration-500">
                    <CrystalIcon className="w-24 h-24 text-primary/30 mb-4" />
                    <h2 className="text-xl font-headline text-foreground">Canvas is Clear</h2>
                    <p>Use the command bar above to get started.</p>
                    <p className="text-xs mt-2">Try: "list all contacts" or "open the armory"</p>
                </div>
            )
          )}
        </DndContext>
      </div>
      <footer className="text-center text-xs text-muted-foreground flex-shrink-0">
        <p>ΛΞVON OS - All rights reserved. | <Link href="/armory" className="hover:text-primary underline">Visit the Armory</Link> | <Link href="/loom" className="hover:text-primary underline">Enter Loom Studio</Link> | <Link href="/validator" className="hover:text-primary underline">Verify Dossier</Link></p>
      </footer>
    </div>
  );
}
