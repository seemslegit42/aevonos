'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import TopBar from '@/components/layout/top-bar';
import MicroAppGrid from '@/components/micro-app-grid';
import { useAppStore } from '@/store/app-store';

export default function Home() {
  const { apps, isLoading, handleDragEnd, handleCommandSubmit } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="flex flex-col h-screen p-4 gap-4">
      <TopBar onCommandSubmit={handleCommandSubmit} isLoading={isLoading} />
      <div className="flex-grow p-4 rounded-lg">
        {isMounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={apps.map((app) => app.id)} strategy={rectSortingStrategy}>
                <MicroAppGrid apps={apps} />
              </SortableContext>
            </DndContext>
        ) : null}
      </div>
       <footer className="text-center text-xs text-muted-foreground">
        <p>ΛΞVON OS - All rights reserved.</p>
      </footer>
    </div>
  );
}
