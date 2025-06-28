
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type MicroApp, useAppStore } from '@/store/app-store';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { getAppIcon, getAppContent } from './micro-app-registry';
import { cn } from '@/lib/utils';

interface MicroAppCardProps {
  app: MicroApp;
}

export default function MicroAppCard({ app }: MicroAppCardProps) {
  const triggerAppAction = useAppStore((state) => state.triggerAppAction);
  const bringToFront = useAppStore((state) => state.bringToFront);
  const Icon = getAppIcon(app.type);
  const ContentComponent = getAppContent(app.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: app.id });

  const style = {
    position: 'absolute' as const,
    top: app.position.y,
    left: app.position.x,
    zIndex: app.zIndex,
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.8 : 1,
    width: '320px', // A default width for the cards
  };

  const hasContent = !!ContentComponent;
  const isActionable = ['echo-control', 'aegis-control', 'ai-suggestion'].includes(app.type) && !hasContent;

  const handlePointerDown = (e: React.PointerEvent) => {
    // Stop propagation to prevent card's listeners from firing when clicking on content
    if (e.target !== e.currentTarget && (e.target as HTMLElement).closest('button, a, input, textarea, select')) {
        return;
    }
    bringToFront(app.id);
  }

  const handleCardClick = () => {
    if (isDragging) return;
    if (isActionable) {
      triggerAppAction(app.id);
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      onPointerDown={handlePointerDown}
      className={cn(
        "bg-foreground/10 backdrop-blur-xl border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] hover:border-primary transition-all duration-300 flex flex-col group",
        isActionable && "cursor-pointer"
      )}
      onClick={handleCardClick}
    >
      <CardHeader
        {...attributes}
        {...listeners}
        className="flex flex-row items-center space-x-4 p-4 cursor-grab active:cursor-grabbing"
      >
        <div className="w-12 h-12 flex-shrink-0 items-center justify-center">
          <Icon className="w-full h-full text-primary" />
        </div>
        <div className="text-left overflow-hidden">
          <CardTitle className="font-headline text-lg text-foreground truncate">{app.title}</CardTitle>
          {!hasContent && (
            <CardDescription className="text-left text-muted-foreground text-sm">
              {app.description}
            </CardDescription>
          )}
        </div>
      </CardHeader>
      {ContentComponent && (
        <CardContent className="flex-grow p-4 pt-0">
           <ContentComponent {...app.contentProps} />
        </CardContent>
      )}
    </Card>
  );
}
