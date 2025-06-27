'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type MicroApp } from '@/app/page';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MicroAppCardProps {
  app: MicroApp;
  index: number;
}

export default function MicroAppCard({ app, index }: MicroAppCardProps) {
  const Icon = app.icon;

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
        {...listeners}
        className="bg-foreground/15 backdrop-blur-[20px] border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] hover:border-primary transition-all duration-300 flex flex-col cursor-grab group"
        onClick={isDragging ? undefined : app.action}
      >
        <CardHeader className="flex flex-col items-center text-center p-4">
          <div className="w-20 h-20 mb-4 flex items-center justify-center">
            <Icon className="w-full h-full text-primary group-hover:scale-110 transition-transform duration-300" />
          </div>
          <CardTitle className="font-headline text-lg text-foreground">{app.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow p-4 pt-0">
          <CardDescription className="text-center text-muted-foreground text-sm">
            {app.description}
          </CardDescription>
        </CardContent>
      </Card>
    </>
  );
}
