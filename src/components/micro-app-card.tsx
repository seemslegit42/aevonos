'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { type MicroApp } from '@/app/page';

interface MicroAppCardProps {
  app: MicroApp;
  index: number;
}

export default function MicroAppCard({ app, index }: MicroAppCardProps) {
  const Icon = app.icon;

  const cardStyle = {
    animation: `fadeInUp 0.5s ${index * 0.1}s ease-out forwards`,
    opacity: 0,
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
        style={cardStyle}
        className="bg-foreground/15 backdrop-blur-[20px] border border-foreground/30 shadow-[0_8px_32px_0_rgba(28,25,52,0.1)] hover:border-primary transition-all duration-300 flex flex-col cursor-pointer group"
        onClick={app.action}
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
