'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type MicroApp, useAppStore } from '@/store/app-store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getAppIcon, getAppContent } from './micro-app-registry';
import { cn } from '@/lib/utils';

interface MicroAppCardProps {
  app: MicroApp;
  index: number;
}

export default function MicroAppCard({ app, index }: MicroAppCardProps) {
  const triggerAppAction = useAppStore((state) => state.triggerAppAction);
  const Icon = getAppIcon(app.type);
  const ContentComponent = getAppContent(app.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app.id });

  const cardAnimationStyle = {
    animation: `fadeInUp 0.5s ${index * 0.1}s ease-out forwards`,
    opacity: 0,
  };

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : undefined,
  };
  
  const style = { ...cardAnimationStyle, ...sortableStyle };
  if(isDragging){
      style.opacity = 0.5;
  }

  const hasContent = !!ContentComponent;
  const isActionable = ['aegis-control', 'ai-suggestion'].includes(app.type) && !hasContent;

  const handleCardClick = () => {
    if (isDragging) return;
    if (isActionable) {
      triggerAppAction(app.id);
    }
  };

  const css = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={cn(
          "bg-foreground/15 backdrop-blur-[20px] border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] hover:border-primary transition-all duration-300 flex flex-col group",
          isActionable && "cursor-pointer"
        )}
        onClick={handleCardClick}
      >
        <CardHeader
          {...listeners}
          className="flex flex-row items-center space-x-4 p-4 cursor-grab"
        >
          <div className="w-12 h-12 flex-shrink-0 items-center justify-center">
            <Icon className="w-full h-full text-primary" />
          </div>
          <div className="text-left">
            <CardTitle className="font-headline text-lg text-foreground">{app.title}</CardTitle>
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
    </>
  );
}
