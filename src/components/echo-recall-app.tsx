'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface EchoRecallAppProps {
  result: {
    summary: string;
    keyPoints: string[];
  };
}

export function EchoRecallApp({ result }: EchoRecallAppProps) {
  const { summary, keyPoints } = result;

  return (
    <ScrollArea className="h-full max-h-48">
      <div className="pr-4">
        <p className="text-sm text-foreground/90 mb-4">{summary}</p>
        <Separator className="my-2 bg-foreground/20" />
        <h5 className="font-semibold text-muted-foreground mb-2 text-xs">Key Points:</h5>
        <ul className="space-y-1 list-disc list-inside text-xs text-foreground/80">
          {keyPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    </ScrollArea>
  );
}
