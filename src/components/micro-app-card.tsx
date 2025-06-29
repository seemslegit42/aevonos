
'use client';

import React from 'react';
import 'react-resizable/css/styles.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type MicroApp, useAppStore } from '@/store/app-store';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { getAppIcon, getAppContent } from './micro-app-registry';
import { cn } from '@/lib/utils';
import { ResizableBox } from 'react-resizable';

interface MicroAppCardProps {
  app: MicroApp;
}

export default function MicroAppCard({ app }: MicroAppCardProps) {
  const triggerAppAction = useAppStore((state) => state.triggerAppAction);
  const bringToFront = useAppStore((state) => state.bringToFront);
  const handleResize = useAppStore((state) => state.handleResize);
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
  };

  const hasContent = !!ContentComponent;
  const isActionable = ['echo-recall', 'aegis-control', 'ai-suggestion'].includes(app.type) && !hasContent;

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
    <div ref={setNodeRef} style={style} className="group" onPointerDown={handlePointerDown}>
        <ResizableBox
            width={app.size.width}
            height={app.size.height}
            onResizeStop={(e, data) => {
                e.stopPropagation();
                handleResize(app.id, data.size);
            }}
            draggableOpts={{ disabled: true }}
            minConstraints={[320, 240]}
            maxConstraints={[1000, 800]}
            className="relative shadow-lg rounded-lg"
            handle={<span className="absolute bottom-2 right-2 box-border w-5 h-5 cursor-se-resize border-2 border-solid border-muted-foreground/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20" />}
        >
            <Card
                className={cn(
                    "bg-[rgba(245,255,250,0.15)] backdrop-blur-[20px] border border-[rgba(245,255,250,0.35)] shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] hover:border-primary transition-all duration-300 flex flex-col w-full h-full",
                    isActionable && "cursor-pointer"
                )}
                onClick={handleCardClick}
            >
                <CardHeader
                    {...attributes}
                    {...listeners}
                    className="flex flex-row items-center space-x-4 p-4 cursor-grab active:cursor-grabbing flex-shrink-0"
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
                    <CardContent className="flex-grow p-0 overflow-hidden min-h-0">
                        <div className="w-full h-full overflow-y-auto">
                            <ContentComponent id={app.id} {...app.contentProps} />
                        </div>
                    </CardContent>
                )}
            </Card>
      </ResizableBox>
    </div>
  );
}
